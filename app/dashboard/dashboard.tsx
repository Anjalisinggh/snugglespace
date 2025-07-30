"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Gift,
  Camera,
  Plus,
  Send,
  LogOut,
  UserPlus,
  Copy,
  Check,
  Share2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type ContentType = "dare" | "order" | "memory";

interface RelatedUser {
  name: string;
}
interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  completed: boolean;
  created_at: string;
  sender?: RelatedUser;
  receiver?: RelatedUser;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  partner_id?: string;
  partner?: {
    id: string;
    name: string;
  } | null;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ContentType>("dare");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", content: "" });
  const [items, setItems] = useState<ContentItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Guard to prevent double-invitation-acceptance
  const invitationHandledRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchContent();
    // Only handle invitation once per session/load
    if (!invitationHandledRef.current) {
      handleInvitationAcceptance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleInvitationAcceptance = async () => {
    invitationHandledRef.current = true;
    const invitationCode = user.user_metadata?.invitation_code;
    if (!invitationCode) return;

    try {
      const { data: invitation, error: inviteError } = await supabase
        .from("partner_invitations")
        .select("*")
        .eq("invitation_code", invitationCode)
        .eq("status", "pending")
        .single();

      if (invitation && !inviteError) {
        const { error: updateError1 } = await supabase
          .from("users")
          .update({ partner_id: invitation.inviter_id })
          .eq("id", user.id);

        const { error: updateError2 } = await supabase
          .from("users")
          .update({ partner_id: user.id })
          .eq("id", invitation.inviter_id);

        await supabase
          .from("partner_invitations")
          .update({ status: "accepted" })
          .eq("id", invitation.id);

        if (!updateError1 && !updateError2) {
          // Immediately refresh profile and content
          await fetchProfile();
          await fetchContent();
        }
      }
    } catch (error) {
      console.error("Error handling invitation:", error);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, avatar_url, partner_id")
        .eq("id", user.id)
        .single();

      if (error) {
        // Create user row if not exists
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email!.split("@")[0],
          })
          .select()
          .single();
        if (insertError) throw insertError;
        setProfile(newUser);
        setLoading(false);
        return;
      }

      let partner = null;
      if (data?.partner_id) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("users")
          .select("id, name")
          .eq("id", data.partner_id)
          .single();
        if (!partnerError && partnerData) {
          partner = partnerData;
        }
      }

      setProfile({ ...data, partner });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select(`
          id, type, title, content, sender_id, receiver_id, completed, created_at,
          sender:sender_id(name),
          receiver:receiver_id(name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedItems: ContentItem[] = data.map((item: any) => ({
        id: item.id,
        type: item.type as ContentType,
        title: item.title,
        content: item.content,
        sender_id: item.sender_id,
        receiver_id: item.receiver_id,
        completed: item.completed,
        created_at: item.created_at,
        sender: Array.isArray(item.sender) ? item.sender[0] : item.sender,
        receiver: Array.isArray(item.receiver) ? item.receiver[0] : item.receiver,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching content:", error);
      return;
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.title.trim() || !newItem.content.trim() || !profile?.partner_id) return;

    try {
      const { error } = await supabase.from("content").insert({
        type: activeTab,
        title: newItem.title,
        content: newItem.content,
        sender_id: user.id,
        receiver_id: profile.partner_id,
      });

      if (error) throw error;

      setNewItem({ title: "", content: "" });
      setShowCreateForm(false);
      fetchContent();
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("content")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error("Error completing item:", error);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleSendInvitation = async () => {
    if (!partnerEmail.trim()) return;

    setInviteLoading(true);
    try {
      const invitationCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from("partner_invitations").insert({
        inviter_id: user.id,
        invitee_email: partnerEmail,
        invitation_code: invitationCode,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      const baseUrl = window.location.origin;
      const inviteUrl = `${baseUrl}?invite=${invitationCode}`;
      setInviteLink(inviteUrl);
      setPartnerEmail("");
    } catch (error) {
      console.error("Error sending invitation:", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInviteLink = async () => {
    if (!inviteLink) return;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "Join me on SnuggleSpace! 💕",
          text: "I've created a private love space for us on SnuggleSpace. Join me!",
          url: inviteLink,
        });
      } catch {
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getTabIcon = (type: ContentType) => {
    switch (type) {
      case "dare":
        return <Sparkles className="w-4 h-4" />;
      case "order":
        return <Gift className="w-4 h-4" />;
      case "memory":
        return <Camera className="w-4 h-4" />;
    }
  };

  const getTabColor = (type: ContentType) => {
    switch (type) {
      case "dare":
        return "from-pink-500 to-rose-500";
      case "order":
        return "from-purple-500 to-indigo-500";
      case "memory":
        return "from-amber-500 to-orange-500";
    }
  };

  const filteredItems = items.filter((item) => item.type === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="flex items-center gap-3"
        >
          <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
          <span className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Loading your space...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  SnuggleSpace
                </h1>
                <p className="text-sm text-gray-600">
                  {profile?.partner?.name ? `You & ${profile.partner.name}` : "Your private love space"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!profile?.partner_id && (
                <Button
                  onClick={() => setShowInvite(true)}
                  variant="outline"
                  size="sm"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Partner
                </Button>
              )}
              <Avatar className="w-8 h-8 border-2 border-pink-200">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowInvite(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold mb-4 text-center">Invite Your Partner 💕</h3>
                {!inviteLink ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Enter your partner's email:</p>
                      <Input
                        placeholder="partner@email.com"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                        type="email"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSendInvitation}
                        disabled={!partnerEmail || inviteLoading}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      >
                        {inviteLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                      <Button onClick={() => setShowInvite(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        Invitation created! Share this link with your partner:
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Invitation Link:</p>
                      <p className="text-sm font-mono break-all">{inviteLink}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyInviteLink} variant="outline" className="flex-1 bg-transparent">
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button
                        onClick={shareInviteLink}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        setShowInvite(false);
                        setInviteLink("");
                      }}
                      variant="ghost"
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Main Dashboard Content (always shown) === */}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-pink-100"
        >
          {(["dare", "order", "memory"] as ContentType[]).map((type) => (
            <motion.button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === type
                  ? "bg-gradient-to-r text-white shadow-lg " + getTabColor(type)
                  : "text-gray-600 hover:bg-white/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {getTabIcon(type)}
              <span className="capitalize">{type}s</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Create New Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`w-full bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all ${getTabColor(
              activeTab,
            )}`}
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Button>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTabIcon(activeTab)}
                    New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Give it a title..."
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="border-pink-200 focus:border-pink-400"
                  />
                  <Textarea
                    placeholder="What's on your mind? 💕"
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    className="border-pink-200 focus:border-pink-400 min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateItem}
                      className={`flex-1 bg-gradient-to-r text-white ${getTabColor(activeTab)}`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send with Love
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)} className="border-pink-200">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className={`border-pink-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all ${
                    item.completed ? "opacity-75" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${getTabColor(item.type)}`}>
                          {getTabIcon(item.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              From {item.sender_id === user.id ? "You" : item.sender?.name}
                            </Badge>
                            {item.completed && (
                              <Badge className="text-xs bg-green-100 text-green-700">Completed ✓</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                    {!item.completed && item.sender_id !== user.id && (
                      <motion.div className="mt-4" whileHover={{ scale: 1.05 }}>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r text-white ${getTabColor(item.type)}`}
                          onClick={() => handleCompleteItem(item.id)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Mark as Done
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getTabColor(
                  activeTab,
                )} flex items-center justify-center`}
              >
                {getTabIcon(activeTab)}
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No {activeTab}s yet</h3>
              <p className="text-gray-500">Create your first {activeTab} to get started! 💕</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
