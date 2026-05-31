"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Home, MessageCircle, Bell, User, LogOut,
  Send, Heart, MessageSquare, Share2, Bookmark,
  Edit3, Check, Camera,
  School, GraduationCap, Plus, Search,
  Monitor, Lightbulb, Music, Code, Settings,
  DollarSign, ChevronDown, X, Eye, Lock,
  Mail, MapPin, Star
} from "lucide-react";
import "./globals.css";

// ==================== TYPES ====================
type Department = "CAS" | "CBAM" | "CCSE" | "CNAHS" | "COA" | "CTED" | "CTHM";
type Year = "1st" | "2nd" | "3rd" | "4th";
type Category = "Academic" | "Music" | "Sports" | "Technology" | "Language";
type PostType = "offer" | "request";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  department: Department;
  year: Year;
  bio?: string;
  location?: string;
  visibility?: "public" | "private";
  avatarUrl?: string;
}

type PostStatus = "active" | "pending" | "completed" | "expired";

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorDept: Department;
  authorYear: Year;
  type: PostType;
  category: Category;
  description: string;
  price: number;
  comments: Comment[];
  timestamp: Date;
  status: PostStatus;
  expiryDate: Date;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: Date;
}

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "message";
  fromUser: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

// ==================== CONTEXT ====================
interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  notifications: Notification[];
  setNotifications: (notifs: Notification[]) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ==================== DATA ====================
const DEPARTMENTS: Department[] = ["CAS", "CBAM", "CCSE", "CNAHS", "COA", "CTED", "CTHM"];
const YEARS: Year[] = ["1st", "2nd", "3rd", "4th"];
const CATEGORIES: Category[] = ["Academic", "Music", "Sports", "Technology", "Language"];

const INITIAL_POSTS: Post[] = [
  {
    id: "1", authorId: "demo1", authorName: "Carlos L.", authorDept: "CCSE", authorYear: "3rd",
    type: "offer", category: "Academic",
    description: "Offering comprehensive Calculus tutoring covering derivatives, integrals, and differential equations. Perfect for engineering and science students.",
    price: 250,
    comments: [], timestamp: new Date(Date.now() - 7200000),
    status: "active" as PostStatus,
    expiryDate: new Date(Date.now() + 604800000)
  },
  {
    id: "2", authorId: "demo2", authorName: "Wendy D.", authorDept: "CBAM", authorYear: "2nd",
    type: "request", category: "Technology",
    description: "Need help with responsive web design, UI/UX improvements, and frontend development using React and modern CSS frameworks.",
    price: 50,
    comments: [], timestamp: new Date(Date.now() - 18000000),
    status: "active" as PostStatus,
    expiryDate: new Date(Date.now() + 604800000)
  },
  {
    id: "3", authorId: "demo3", authorName: "Yuki C.", authorDept: "CTHM", authorYear: "1st",
    type: "offer", category: "Sports",
    description: "Offering free yoga sessions in exchange for photography or video editing skills. Beginner-friendly classes focusing on flexibility and mindfulness.",
    price: 0,
    comments: [], timestamp: new Date(Date.now() - 86400000),
    status: "active" as PostStatus,
    expiryDate: new Date(Date.now() + 604800000)
  },
  {
    id: "4", authorId: "demo4", authorName: "Paul Y.", authorDept: "CCSE", authorYear: "4th",
    type: "offer", category: "Technology",
    description: "Advanced Python tutoring including data structures, algorithms, machine learning basics, and data visualization with pandas and matplotlib.",
    price: 200,
    comments: [], timestamp: new Date(Date.now() - 172800000),
    status: "active" as PostStatus,
    expiryDate: new Date(Date.now() + 604800000)
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "message", fromUser: "Maria Santos", content: "sent you a message about your Calculus tutoring post", timestamp: new Date(Date.now() - 300000), read: false },
];

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", senderId: "example_user", senderName: "Maria Santos", recipientId: "user_current", content: "Hi! I saw your post about Calculus tutoring. Are you available this Friday?", timestamp: new Date(Date.now() - 600000) },
];

// ==================== COMPONENTS ====================
// ==================== STATUS BADGE ====================
function StatusBadge({ status }: { status: PostStatus }) {
  const styles: Record<PostStatus, { bg: string; color: string; label: string }> = {
    active: { bg: "rgba(42,157,143,0.15)", color: "#2a9d8f", label: "Active" },
    pending: { bg: "rgba(212,168,67,0.15)", color: "#d4a843", label: "Pending" },
    completed: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Completed" },
    expired: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Expired" },
  };
  const style = styles[status] || styles["active"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
      padding: "3px 10px", borderRadius: 20,
      background: style.bg, color: style.color,
    }}>{style.label}</span>
  );
}

// Helper to format time ago
function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return new Date(date).toLocaleDateString();
}

function Avatar({ name, size = 40, src }: { name: string; size?: number; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0,
          border: "2px solid #2a2d35"
        }}
      />
    );
  }
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#2a9d8f", "#d4a843", "#e76f51", "#264653", "#e9c46a", "#f4a261"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.4, flexShrink: 0
    }}>{initials}</div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "linear-gradient(135deg, #2a9d8f 0%, #d4a843 100%)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}><Monitor size={20} color="white" /></div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.5px" }}>DLSP</div>
        <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "2px" }}>SKILL HUB</div>
      </div>
    </div>
  );
}

// ==================== LANDING SCREEN ====================
function LandingScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f1115" }}>
      <div className="header-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(32px, 8vw, 64px)", fontWeight: 800, color: "#e2e8f0", marginBottom: 16, lineHeight: 1.1 }}>
          DLSP<br />SKILL HUB
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 500, marginBottom: 40, lineHeight: 1.6 }}>
          Unlock potential. Trade talents. Your university marketplace for learning new skills and sharing yours with fellow students.
        </p>
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
          {[Monitor, Lightbulb, Music, Code, Settings].map((Icon, i) => (
            <div key={i} style={{
              width: 56, height: 56, borderRadius: 14,
              background: "#1a1d23", border: "1px solid #2a2d35",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}><Icon size={24} color={i % 2 === 0 ? "#2a9d8f" : "#d4a843"} /></div>
          ))}
        </div>
        <button onClick={onGetStarted} className="campus-btn campus-btn-primary" style={{ padding: "16px 48px", fontSize: 16 }}>
          GET STARTED
        </button>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 20 }}>
          Join thousands of students connecting and growing today.
        </p>
      </div>
    </div>
  );
}

// ==================== LOGIN SCREEN ====================
function LoginScreen({ onSwitch }: { onSwitch: () => void }) {
  const { setCurrentUser, setPosts, setMessages, setNotifications } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!email.includes("@")) { setError("Please enter a valid email"); return; }
    const savedUsers = JSON.parse(localStorage.getItem("campus_users") || "[]");
    const user = savedUsers.find((u: UserProfile) => {
      if (u.email) return u.email.toLowerCase() === email.toLowerCase().trim();
      return u.username.toLowerCase() === email.toLowerCase().trim();
    });
    if (!user) { setError("No account found. Please sign up first."); return; }
    setCurrentUser(user);
    setPosts(INITIAL_POSTS);
    setMessages(INITIAL_MESSAGES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f1115" }}>
      <div className="header-bar"><Logo /></div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="campus-card" style={{ maxWidth: 420, width: "100%", padding: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>Welcome Back</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Sign in to continue trading skills</p>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>{error}</div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", width: 18, height: 18 }} />
                <input type="email" className="campus-input" style={{ paddingLeft: 42 }} placeholder="your.email@school.edu" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="campus-btn campus-btn-primary" style={{ width: "100%", marginBottom: 20 }}>
              <LogOut size={18} /> Sign In
            </button>
          </form>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              Don&apos;t have an account?{" "}
              <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#2a9d8f", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Create one now</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SIGNUP SCREEN ====================
function SignupScreen({ onSwitch }: { onSwitch: () => void }) {
  const { setCurrentUser } = useApp();
  const [formData, setFormData] = useState({ email: "", username: "", name: "", department: "" as Department | "", year: "" as Year | "" });
  const [error, setError] = useState("");

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleCreate = () => {
    if (!formData.email.trim() || !formData.username.trim() || !formData.name.trim() || !formData.department || !formData.year) {
      setError("Please fill in all fields"); return;
    }
    if (!formData.email.includes("@")) { setError("Please enter a valid email"); return; }
    const savedUsers = JSON.parse(localStorage.getItem("campus_users") || "[]");
    const existingEmail = savedUsers.find((u: UserProfile) => u.email.toLowerCase() === formData.email.toLowerCase().trim());
    if (existingEmail) { setError("Email already registered."); return; }
    const existingUser = savedUsers.find((u: UserProfile) => u.username.toLowerCase() === formData.username.toLowerCase().trim());
    if (existingUser) { setError("Username already taken."); return; }
    const newUser: UserProfile = {
      id: "user_" + Date.now(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      name: formData.name.trim(),
      department: formData.department as Department,
      year: formData.year as Year,
    };
    savedUsers.push(newUser);
    localStorage.setItem("campus_users", JSON.stringify(savedUsers));
    setCurrentUser(newUser);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f1115" }}>
      <div className="header-bar"><Logo /></div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="campus-card" style={{ maxWidth: 480, width: "100%", padding: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>Create Account</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Fill in your information to get started</p>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>{error}</div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", width: 18, height: 18 }} />
              <input type="email" className="campus-input" style={{ paddingLeft: 42 }} placeholder="your.email@school.edu" value={formData.email} onChange={e => updateField("email", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Full Name</label>
            <input type="text" className="campus-input" placeholder="Juan Dela Cruz" value={formData.name} onChange={e => updateField("name", e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Username</label>
            <input type="text" className="campus-input" placeholder="@username" value={formData.username} onChange={e => updateField("username", e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Department</label>
            <select className="campus-input select-styled" value={formData.department} onChange={e => updateField("department", e.target.value)}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Year Level</label>
            <select className="campus-input select-styled" value={formData.year} onChange={e => updateField("year", e.target.value)}>
              <option value="">Select Year</option>
              {YEARS.map(year => <option key={year} value={year}>{year} Year</option>)}
            </select>
          </div>
          <button onClick={handleCreate} className="campus-btn campus-btn-primary" style={{ width: "100%", marginBottom: 20 }}>Create Account</button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              Already have an account?{" "}
              <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#2a9d8f", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CONNECT MODAL ====================
function ConnectModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const { currentUser, messages, setMessages } = useApp();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;

    // Save the message to messages with recipient = post author
    const newMsg: Message = {
      id: "msg_" + Date.now(),
      senderId: currentUser?.id || "",
      senderName: currentUser?.name || "You",
      recipientId: post.authorId,
      content: message,
      timestamp: new Date()
    };
    setMessages([...messages, newMsg]);

    setSent(true);
    setTimeout(() => { onClose(); }, 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div style={{
        background: "#1a1d23", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 480, margin: "20px",
        border: "1px solid #2a2d35",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>Connect with {post.authorName}</h3>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Regarding: {post.category}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(42,157,143,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Check size={28} color="#2a9d8f" />
            </div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Message Sent!</h4>
            <p style={{ fontSize: 14, color: "#6b7280" }}>{post.authorName} will receive your message shortly.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#252830", borderRadius: 12, marginBottom: 24 }}>
              <Avatar name={post.authorName} size={48} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>{post.authorName}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{post.authorDept}</div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Your Message</label>
              <textarea
                className="campus-input"
                style={{ minHeight: 120, resize: "none" }}
                placeholder={`Hi ${post.authorName}, I am interested in your ${post.category}...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            <button onClick={handleSend} className="campus-btn campus-btn-primary" style={{ width: "100%", padding: "16px" }} disabled={!message.trim()}>
              <Send size={18} /> Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}


// ==================== SHARE MODAL ====================
function ShareModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div style={{
        background: "#1a1d23", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 400, margin: "20px",
        border: "1px solid #2a2d35",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>Share Skill</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 20, lineHeight: 1.5 }}>
          Copy this link to share <strong style={{ color: "#e2e8f0" }}>{post.category}</strong> skill with others.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" className="campus-input" value={shareUrl} readOnly style={{ flex: 1, fontSize: 13 }} />
          <button onClick={handleCopy} className="campus-btn campus-btn-primary" style={{ padding: "10px 20px", whiteSpace: "nowrap" }}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== HOME / EXPLORE SCREEN ====================
function HomeFeed({ onCreatePost }: { onCreatePost: () => void }) {
  const { currentUser, posts, setPosts } = useApp();

  // Auto-expire posts
  useEffect(() => {
    const now = new Date();
    const updated = posts.map(post => {
      if (post.status === "active" && new Date(post.expiryDate) < now) {
        return { ...post, status: "expired" as PostStatus };
      }
      return post;
    });
    const hasChanges = updated.some((p, i) => p.status !== posts[i].status);
    if (hasChanges) setPosts(updated);
  }, [posts]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [connectPost, setConnectPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deletePost, setDeletePost] = useState<Post | null>(null);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, { id: "c_" + Date.now(), authorId: currentUser?.id || "", authorName: currentUser?.name || "Anonymous", content: commentText, timestamp: new Date() }] };
      }
      return post;
    }));
    setCommentText("");
    setShowComments(null);
  };

  const userPosts = posts.filter(p => p.authorId === currentUser?.id);

    // Helper functions for post actions
  const handleMarkDone = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: "completed" as PostStatus } : p));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px", display: "flex", gap: 24 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", marginBottom: 24 }}>Explore Skills</h2>

        <div className="search-bar" style={{ marginBottom: 16 }}>
          <Search size={18} />
          <input type="text" placeholder="Search skills..." style={{ background: "none", border: "none", color: "#e2e8f0", fontSize: 15, flex: 1, outline: "none" }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <button className="connect-btn" style={{ padding: "6px 12px" }}><Search size={14} /></button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <select 
            className="campus-input select-styled" 
            style={{ width: "auto", minWidth: 160, padding: "10px 40px 10px 16px", fontSize: 14 }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filteredPosts.map(post => (
            <div key={post.id} className="skill-card" style={{ padding: 20, borderRadius: 16, background: "#1a1d23", border: "1px solid #2a2d35" }}>
              {/* Header: Avatar + Name/Dept | Price + Time */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={post.authorName} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{post.authorName}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{post.authorDept}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2a9d8f" }}>{post.price === 0 ? "Free" : `₱${post.price}`}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{timeAgo(post.timestamp)}</div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5, marginBottom: 14 }}>{post.description}</p>

              {/* Type + Status */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#2a9d8f", fontWeight: 500 }}>
                  {post.type === "offer" ? "Offering" : "Requesting"} {post.category}
                </span>
                <StatusBadge status={post.status} />
              </div>

              {/* Expiry */}
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                Expires: {new Date(post.expiryDate).toLocaleDateString()}
                {new Date(post.expiryDate) < new Date() && <span style={{ color: "#ef4444" }}> (Expired)</span>}
              </div>

              {/* Category Badge */}
              <div style={{ marginBottom: 14 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#2a9d8f",
                  background: "rgba(42,157,143,0.12)",
                  padding: "4px 12px", borderRadius: 20,
                  display: "inline-block"
                }}>{post.category}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <button onClick={() => setShowComments(showComments === post.id ? null : post.id)} style={{ background: "none", border: "none", color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
                    <MessageSquare size={16} />{post.comments.length}
                  </button>
                  <button onClick={() => setSharePost(post)} style={{ background: "none", border: "none", color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
                {post.authorId === currentUser?.id ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setEditPost(post)} style={{
                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      background: "#252830", color: "#9ca3af",
                      border: "1px solid #3a3d45", borderRadius: 8,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    {post.status !== "completed" && (
                      <button onClick={() => handleMarkDone(post.id)} style={{
                        padding: "6px 14px", fontSize: 12, fontWeight: 500,
                        background: "rgba(59,130,246,0.15)", color: "#3b82f6",
                        border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                      }}>
                        <Check size={14} /> Mark Done
                      </button>
                    )}
                    <button onClick={() => setDeletePost(post)} style={{
                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      background: "rgba(239,68,68,0.15)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <X size={14} /> Delete
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConnectPost(post)} style={{
                    padding: "6px 14px", fontSize: 12, fontWeight: 600,
                    background: "#2a9d8f", color: "white",
                    border: "none", borderRadius: 8,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                  }}><Send size={14} /> Connect</button>
                )}
              </div>

              {/* Comments Section */}
              {showComments === post.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #2a2d35" }}>
                  {post.comments.map(comment => (
                    <div key={comment.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <Avatar name={comment.authorName} size={32} />
                      <div style={{ flex: 1, background: "#252830", padding: "10px 14px", borderRadius: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{comment.authorName}</span>
                        <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 2 }}>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <Avatar name={currentUser?.name || "U"} size={32} />
                    <div style={{ flex: 1, display: "flex", gap: 8 }}>
                      <input type="text" className="comment-input" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyPress={e => e.key === "Enter" && handleComment(post.id)} />
                      <button onClick={() => handleComment(post.id)} className="campus-btn campus-btn-primary" style={{ padding: "8px 16px", borderRadius: 20 }}><Send size={14} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 300, flexShrink: 0 }}>
        {/* Sidebar content removed */}
      </div>

      {connectPost && <ConnectModal post={connectPost} onClose={() => setConnectPost(null)} />}
      {sharePost && <ShareModal post={sharePost} onClose={() => setSharePost(null)} />}
      {editPost && <EditPostModal post={editPost} onClose={() => setEditPost(null)} onSave={(updated) => {
        setPosts(posts.map(p => p.id === updated.id ? updated : p));
        setEditPost(null);
      }} />}
      {deletePost && <DeletePostModal post={deletePost} onClose={() => setDeletePost(null)} onConfirm={() => {
        setPosts(posts.filter(p => p.id !== deletePost.id));
        setDeletePost(null);
      }} />}
    </div>
  );
}


// ==================== EDIT POST MODAL ====================
function EditPostModal({ post, onClose, onSave }: { post: Post; onClose: () => void; onSave: (post: Post) => void }) {
  const [description, setDescription] = useState(post.description);
  const [price, setPrice] = useState(post.price.toString());
  const [category, setCategory] = useState<Category>(post.category);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [expiryDate, setExpiryDate] = useState(new Date(post.expiryDate).toISOString().split('T')[0]);

  const handleSave = () => {
    const updated: Post = {
      ...post,
      description: description.trim(),
      price: Number(price) || 0,
      category,
      status,
      expiryDate: status === "active" ? new Date(expiryDate + 'T23:59:59') : post.expiryDate,
    };
    onSave(updated);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div style={{
        background: "#1a1d23", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 480, margin: "20px",
        border: "1px solid #2a2d35",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>Edit Post</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Category</label>
          <select className="campus-input select-styled" value={category} onChange={e => setCategory(e.target.value as Category)}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Description</label>
          <textarea className="campus-input" style={{ minHeight: 100, resize: "none" }} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Price (₱)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#2a9d8f", fontWeight: 700 }}>₱</span>
            <input type="number" className="campus-input" style={{ paddingLeft: 32 }} value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Status</label>
          <select className="campus-input select-styled" value={status} onChange={e => setStatus(e.target.value as PostStatus)}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {status === "active" && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Expiry Date</label>
            <input 
              type="date" 
              className="campus-input" 
              value={expiryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setExpiryDate(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave} className="campus-btn campus-btn-primary" style={{ flex: 1 }}>
            <Check size={16} /> Save Changes
          </button>
          <button onClick={onClose} className="campus-btn campus-btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== DELETE POST MODAL ====================
function DeletePostModal({ post, onClose, onConfirm }: { post: Post; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div style={{
        background: "#1a1d23", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 400, margin: "20px",
        border: "1px solid #2a2d35",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <X size={28} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Delete Post?</h3>
          <p style={{ fontSize: 14, color: "#6b7280" }}>This action cannot be undone.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onConfirm} className="campus-btn" style={{ flex: 1, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
            <X size={16} /> Delete
          </button>
          <button onClick={onClose} className="campus-btn campus-btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CREATE POST SCREEN ====================
function CreatePostScreen({ onBack }: { onBack: () => void }) {
  const { currentUser, posts, setPosts } = useApp();
  const [postType, setPostType] = useState<PostType>("offer");
  const [category, setCategory] = useState<Category | "">("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const handlePost = () => {
    if (!category || !description.trim()) {
      setError("Please fill in all required fields"); return;
    }
    const now = new Date();
    const post: Post = {
      id: "post_" + Date.now(),
      authorId: currentUser?.id || "",
      authorName: currentUser?.name || "Anonymous",
      authorDept: currentUser?.department || "CAS",
      authorYear: currentUser?.year || "1st",
      type: postType,
      category: category as Category,
      description: description.trim(),
      price: Number(price) || 0,
      comments: [],
      timestamp: now,
      status: "active",
      expiryDate: new Date(expiryDate + 'T23:59:59')
    };
    setPosts([post, ...posts]);
    onBack();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10 }}>
          <X size={24} color="#e2e8f0" />
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>CREATE NEW POSTING</h2>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>{error}</div>
      )}

      <div className="campus-card" style={{ padding: 28 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button onClick={() => setPostType("request")} className={`toggle-btn ${postType === "request" ? "toggle-btn-active" : "toggle-btn-inactive"}`}>
            <Edit3 size={14} /> Request a Skill
          </button>
          <button onClick={() => setPostType("offer")} className={`toggle-btn ${postType === "offer" ? "toggle-btn-active" : "toggle-btn-inactive"}`}>
            <Plus size={14} /> Offer a Skill
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Select Category</label>
          <select className="campus-input select-styled" value={category} onChange={e => { setCategory(e.target.value as Category | ""); setError(""); }}>
            <option value="">Select Category</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Description</label>
          <textarea className="campus-input" style={{ minHeight: 100, resize: "none" }} placeholder="Describe what you need or what you are offering..." value={description} onChange={e => { setDescription(e.target.value); setError(""); }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}><DollarSign size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Price (₱)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#2a9d8f", fontWeight: 700 }}>₱</span>
            <input type="number" className="campus-input" style={{ paddingLeft: 32 }} placeholder="0" min="0" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Enter 0 for free services</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Expiry Date</label>
          <input 
            type="date" 
            className="campus-input" 
            value={expiryDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setExpiryDate(e.target.value)}
          />
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Your post will be visible until this date</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <button onClick={handlePost} className="campus-btn campus-btn-primary" style={{ width: "100%", padding: "16px" }}>
            <Send size={18} /> Post Your Skill {postType === "offer" ? "Offer" : "Request"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ==================== NEW MESSAGE MODAL ====================
function NewMessageModal({ onClose }: { onClose: () => void }) {
  const { currentUser, posts, messages, setMessages } = useApp();
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  // Get all unique users from posts (excluding current user)
  const allUsers = Array.from(new Set(posts.map(p => p.authorId)))
    .filter(id => id !== currentUser?.id)
    .map(id => {
      const post = posts.find(p => p.authorId === id);
      return { id, name: post?.authorName || "Unknown", dept: post?.authorDept || "" };
    });

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    const newMsg: Message = {
      id: "msg_" + Date.now(),
      senderId: currentUser?.id || "",
      senderName: currentUser?.name || "You",
      recipientId: selectedUser,
      content: message,
      timestamp: new Date()
    };
    setMessages([...messages, newMsg]);
    setSent(true);
    setTimeout(() => { onClose(); }, 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div style={{
        background: "#1a1d23", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 480, margin: "20px",
        border: "1px solid #2a2d35",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>New Message</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(42,157,143,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Check size={28} color="#2a9d8f" />
            </div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Message Sent!</h4>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>To</label>
              <select 
                className="campus-input select-styled" 
                value={selectedUser} 
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="">Select a user</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.dept})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>Message</label>
              <textarea
                className="campus-input"
                style={{ minHeight: 120, resize: "none" }}
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <button onClick={handleSend} className="campus-btn campus-btn-primary" style={{ width: "100%", padding: "16px" }} disabled={!message.trim() || !selectedUser}>
              <Send size={18} /> Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== MESSAGES ====================
function MessagesScreen() {
  const { messages, setMessages, currentUser, posts } = useApp();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [ratingSent, setRatingSent] = useState(false);

  // Build conversation partners from both sent and received messages
  const partnerMap = new Map<string, { name: string; dept: string }>();

  messages.forEach(m => {
    if (m.senderId === currentUser?.id && m.recipientId) {
      // We sent a message — recipient is a partner
      if (!partnerMap.has(m.recipientId)) {
        const post = posts.find(p => p.authorId === m.recipientId);
        partnerMap.set(m.recipientId, {
          name: post?.authorName || "User",
          dept: post?.authorDept || ""
        });
      }
    } else if (m.senderId !== currentUser?.id) {
      // Someone sent us a message — sender is a partner
      if (!partnerMap.has(m.senderId)) {
        partnerMap.set(m.senderId, { name: m.senderName, dept: "" });
      }
    }
  });

  const chatUsers = Array.from(partnerMap.entries()).map(([id, info]) => ({
    id,
    name: info.name,
    dept: info.dept
  }));

  // Get all messages in this conversation (both directions)
  const currentMessages = messages.filter(m => {
    if (!selectedChat) return false;
    const isFromMeToThem = m.senderId === currentUser?.id && m.recipientId === selectedChat;
    const isFromThemToMe = m.senderId === selectedChat && m.recipientId === currentUser?.id;
    return isFromMeToThem || isFromThemToMe;
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const msg: Message = {
      id: "msg_" + Date.now(),
      senderId: currentUser?.id || "",
      senderName: currentUser?.name || "You",
      recipientId: selectedChat,
      content: newMessage,
      timestamp: new Date()
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  // Get last message preview for sidebar
  const getLastMessage = (userId: string) => {
    const convo = messages.filter(m => {
      const isBetweenUs =
        (m.senderId === currentUser?.id && m.recipientId === userId) ||
        (m.senderId === userId && m.recipientId === currentUser?.id);
      return isBetweenUs;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return convo[0];
  };

  const handleRatingSubmit = () => {
    if (rating === 0) return;
    // In a real app, send to API. Here we just show success.
    setRatingSent(true);
    setTimeout(() => {
      setShowRating(false);
      setRatingSent(false);
      setRating(0);
      setFeedback("");
    }, 2000);
  };

  const selectedUserName = chatUsers.find(u => u.id === selectedChat)?.name || "";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", height: "calc(100vh - 80px)", display: "flex" }}>
      <div style={{ width: 280, borderRight: "1px solid #2a2d35", background: "#1a1d23", borderRadius: "16px 0 0 16px", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #2a2d35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>Messages</h2>
          <button onClick={() => setShowNewMessage(true)} className="connect-btn" style={{ padding: "6px 12px" }}>
            <Plus size={14} /> New
          </button>
        </div>
        <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
          {chatUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>No messages yet</p>
            </div>
          ) : (
            chatUsers.map(user => {
              const lastMsg = getLastMessage(user.id);
              return (
                <div key={user.id} onClick={() => setSelectedChat(user.id)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 20px", cursor: "pointer",
                  background: selectedChat === user.id ? "rgba(42,157,143,0.08)" : "transparent",
                  borderLeft: selectedChat === user.id ? "3px solid #2a9d8f" : "3px solid transparent"
                }}>
                  <Avatar name={user.name} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{user.name}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lastMsg ? (lastMsg.senderId === currentUser?.id ? "You: " : "") + lastMsg.content : "Start chatting"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: "#0f1115", borderRadius: "0 16px 16px 0", display: "flex", flexDirection: "column", position: "relative" }}>
        {selectedChat ? (
          <>
            <div style={{ padding: "16px 20px", background: "#1a1d23", borderBottom: "1px solid #2a2d35", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={selectedUserName} size={40} />
                <div>
                  <span style={{ fontWeight: 700, color: "#e2e8f0", display: "block" }}>{selectedUserName}</span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{chatUsers.find(u => u.id === selectedChat)?.dept}</span>
                </div>
              </div>
              <button
                onClick={() => setShowRating(true)}
                style={{
                  padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  background: "rgba(212,168,67,0.15)", color: "#d4a843",
                  border: "1px solid rgba(212,168,67,0.3)", borderRadius: 8,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
              >
                <Star size={14} /> Rate
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {currentMessages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.senderId === currentUser?.id ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                  <div style={{
                    background: msg.senderId === currentUser?.id ? "#2a9d8f" : "#1a1d23",
                    color: msg.senderId === currentUser?.id ? "white" : "#e2e8f0",
                    padding: "12px 16px", borderRadius: 16,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    fontSize: 14, lineHeight: 1.5
                  }}>{msg.content}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, textAlign: msg.senderId === currentUser?.id ? "right" : "left" }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, background: "#1a1d23", borderTop: "1px solid #2a2d35", display: "flex", gap: 12 }}>
              <input type="text" className="campus-input" style={{ flex: 1 }} placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSend()} />
              <button onClick={handleSend} className="campus-btn campus-btn-primary" style={{ padding: "12px 20px" }}><Send size={18} /></button>
            </div>

            {/* Rating Modal */}
            {showRating && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
              }} onClick={() => setShowRating(false)}>
                <div style={{
                  background: "#1a1d23", borderRadius: 20, padding: 32,
                  width: "100%", maxWidth: 420, margin: "20px",
                  border: "1px solid #2a2d35",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
                }} onClick={e => e.stopPropagation()}>
                  {ratingSent ? (
                    <div style={{ textAlign: "center", padding: "30px 20px" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(42,157,143,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <Check size={28} color="#2a9d8f" />
                      </div>
                      <h4 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Thank You!</h4>
                      <p style={{ fontSize: 14, color: "#6b7280" }}>Your rating has been submitted.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <div>
                          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>Rate {selectedUserName}</h3>
                          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>How was your experience?</p>
                        </div>
                        <button onClick={() => setShowRating(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#6b7280" }}>
                          <X size={20} />
                        </button>
                      </div>

                      {/* Stars */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                          >
                            <Star
                              size={32}
                              color={star <= (hoverRating || rating) ? "#d4a843" : "#3a3d45"}
                              fill={star <= (hoverRating || rating) ? "#d4a843" : "none"}
                            />
                          </button>
                        ))}
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Feedback (optional)</label>
                        <textarea
                          className="campus-input"
                          style={{ minHeight: 80, resize: "none" }}
                          placeholder="Share your experience..."
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={handleRatingSubmit}
                        disabled={rating === 0}
                        className="campus-btn campus-btn-primary"
                        style={{ width: "100%", padding: "14px", opacity: rating === 0 ? 0.5 : 1 }}
                      >
                        Submit Rating
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
            <MessageCircle size={64} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
      {showNewMessage && <NewMessageModal onClose={() => setShowNewMessage(false)} />}
    </div>
  );
}

// ==================== NOTIFICATIONS ====================
function NotificationsScreen() {
  const { notifications, setNotifications } = useApp();

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart size={18} color="#ef4444" />;
      case "comment": return <MessageSquare size={18} color="#2a9d8f" />;
      case "follow": return <User size={18} color="#d4a843" />;
      case "message": return <MessageCircle size={18} color="#2a9d8f" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>Notifications</h2>
        <button onClick={markAllRead} className="campus-btn campus-btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>Mark all read</button>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
          <Bell size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No notifications yet</p>
        </div>
      ) : (
        notifications.map(notif => (
          <div key={notif.id} className="post-card" style={{
            display: "flex", gap: 14, alignItems: "flex-start",
            marginBottom: 12,
            background: notif.read ? "#1a1d23" : "rgba(42,157,143,0.05)",
            borderLeft: notif.read ? "none" : "3px solid #2a9d8f"
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(42,157,143,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {getIcon(notif.type)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "#e2e8f0" }}><strong>{notif.fromUser}</strong> {notif.content}</p>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {!notif.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a9d8f", flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))
      )}
    </div>
  );
}

// ==================== PROFILE ====================
function ProfileScreen() {
  const { currentUser, setCurrentUser, posts, setPosts, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deletePost, setDeletePost] = useState<Post | null>(null);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
    location: currentUser?.location || "",
    visibility: currentUser?.visibility || "public" as "public" | "private",
    avatarUrl: currentUser?.avatarUrl || "",
  });

  const userPosts = posts.filter(p => p.authorId === currentUser?.id);

  const handleSave = () => {
    if (currentUser) {
      const updated = { ...currentUser, ...editForm };
      setCurrentUser(updated);
      const savedUsers = JSON.parse(localStorage.getItem("campus_users") || "[]");
      const idx = savedUsers.findIndex((u: UserProfile) => u.id === currentUser.id);
      if (idx >= 0) { savedUsers[idx] = updated; localStorage.setItem("campus_users", JSON.stringify(savedUsers)); }
    }
    setIsEditing(false);
  };

    // Helper functions for post actions
  const handleMarkDone = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: "completed" as PostStatus } : p));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px" }}>
      <div className="campus-card" style={{ padding: 32, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 24 }}>EDIT PROFILE INFO</h2>

        {isEditing ? (
          <div>
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                  <Avatar name={currentUser?.name || "U"} size={80} src={editForm.avatarUrl || currentUser?.avatarUrl} />
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <label htmlFor="avatar-upload" style={{ background: "none", border: "none", color: "#2a9d8f", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Camera size={14} /> Update Photo
                </label>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#9ca3af" }}>Username</label>
                  <input className="campus-input" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#9ca3af" }}>Full Name</label>
                  <input className="campus-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#9ca3af" }}>Primary Department</label>
                  <select className="campus-input select-styled" value={currentUser?.department} disabled>
                    <option>{currentUser?.department}</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#9ca3af" }}>Bio (for public profile)</label>
              <textarea className="campus-input" style={{ minHeight: 100, resize: "none" }} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#9ca3af" }}>Location/Campus</label>
              <input className="campus-input" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="Your campus location..." />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Profile Visibility</label>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditForm({ ...editForm, visibility: "public" })} className={`campus-btn ${editForm.visibility === "public" ? "campus-btn-primary" : "campus-btn-secondary"}`} style={{ flex: 1 }}>
                  <Eye size={14} /> Public
                </button>
                <button onClick={() => setEditForm({ ...editForm, visibility: "private" })} className={`campus-btn ${editForm.visibility === "private" ? "campus-btn-primary" : "campus-btn-secondary"}`} style={{ flex: 1 }}>
                  <Lock size={14} /> Private
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={handleSave} className="campus-btn campus-btn-primary"><Check size={16} /> Save Changes</button>
              <button onClick={() => setIsEditing(false)} className="campus-btn campus-btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              <div style={{ textAlign: "center" }}><Avatar name={currentUser?.name || "U"} size={80} src={currentUser?.avatarUrl} /></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{currentUser?.name}</h3>
                <p style={{ color: "#d4a843", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>@{currentUser?.username}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-dept"><School size={12} style={{ marginRight: 4 }} />{currentUser?.department}</span>
                  <span className="badge badge-year"><GraduationCap size={12} style={{ marginRight: 4 }} />{currentUser?.year} Year</span>
                </div>
              </div>
            </div>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{currentUser?.bio || "No bio yet. Click edit to add one!"}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setIsEditing(true)} className="campus-btn campus-btn-primary"><Edit3 size={16} /> Edit Profile</button>
              <button onClick={logout} className="campus-btn campus-btn-secondary"><LogOut size={16} /> Logout</button>
            </div>
          </div>
        )}
      </div>



      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>My Postings Dashboard</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div className="stat-box"><div className="stat-number">{userPosts.filter(p => p.status === "active").length}</div><div className="stat-label">Active</div></div>
          <div className="stat-box"><div className="stat-number">{userPosts.filter(p => p.status === "completed").length}</div><div className="stat-label">Completed</div></div>
          <div className="stat-box"><div className="stat-number">{userPosts.filter(p => p.status === "pending").length}</div><div className="stat-label">Pending</div></div>
        </div>
        <div style={{ borderTop: "1px solid #2a2d35", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 14, color: "#9ca3af" }}>Requests</span><span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{userPosts.filter(p => p.type === "request").length}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 14, color: "#9ca3af" }}>Completed</span><span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{userPosts.filter(p => p.status === "completed").length}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 14, color: "#9ca3af" }}>Pending</span><span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{userPosts.filter(p => p.type === "offer" && p.status === "pending").length}</span></div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#e2e8f0" }}>Your Postings</h3>
        {userPosts.length === 0 ? (
          <div className="post-card" style={{ textAlign: "center", padding: 40, color: "#6b7280" }}><p>No posts yet. Share a skill with your campus!</p></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {userPosts.map(post => (
              <div key={post.id} className="skill-card" style={{ padding: 20, borderRadius: 16, background: "#1a1d23", border: "1px solid #2a2d35" }}>
                {/* Header: Avatar + Name/Dept | Price + Time */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name={post.authorName} size={44} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{post.authorName}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>{post.authorDept}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#2a9d8f" }}>{post.price === 0 ? "Free" : `₱${post.price}`}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{timeAgo(post.timestamp)}</div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5, marginBottom: 14 }}>{post.description}</p>

                {/* Type + Status */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#2a9d8f", fontWeight: 500 }}>
                    {post.type === "offer" ? "Offering" : "Requesting"} {post.category}
                  </span>
                  <StatusBadge status={post.status} />
                </div>

                {/* Expiry */}
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                  Expires: {new Date(post.expiryDate).toLocaleDateString()}
                </div>

                {/* Category Badge */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: "#2a9d8f",
                    background: "rgba(42,157,143,0.12)",
                    padding: "4px 12px", borderRadius: 20,
                    display: "inline-block"
                  }}>{post.category}</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <button style={{ background: "none", border: "none", color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
                      <MessageSquare size={16} />{post.comments.length}
                    </button>
                    <button onClick={() => setSharePost(post)} style={{ background: "none", border: "none", color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setEditPost(post)} style={{
                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      background: "#252830", color: "#9ca3af",
                      border: "1px solid #3a3d45", borderRadius: 8,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    {post.status !== "completed" && (
                      <button onClick={() => handleMarkDone(post.id)} style={{
                        padding: "6px 14px", fontSize: 12, fontWeight: 500,
                        background: "rgba(59,130,246,0.15)", color: "#3b82f6",
                        border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                      }}>
                        <Check size={14} /> Mark Done
                      </button>
                    )}
                    <button onClick={() => setDeletePost(post)} style={{
                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      background: "rgba(239,68,68,0.15)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <X size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {sharePost && <ShareModal post={sharePost} onClose={() => setSharePost(null)} />}
      {editPost && <EditPostModal post={editPost} onClose={() => setEditPost(null)} onSave={(updated) => {
        setPosts(posts.map(p => p.id === updated.id ? updated : p));
        setEditPost(null);
      }} />}
      {deletePost && <DeletePostModal post={deletePost} onClose={() => setDeletePost(null)} onConfirm={() => {
        setPosts(posts.filter(p => p.id !== deletePost.id));
        setDeletePost(null);
      }} />}
    </div>
  );
}

// ==================== BOTTOM NAV ====================
function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const { notifications } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#1a1d23", borderTop: "1px solid #2a2d35",
      padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
      zIndex: 50
    }}>
      <div style={{ display: "flex", justifyContent: "space-around", maxWidth: 600, margin: "0 auto" }}>
        {tabs.map(tab => (
          <div key={tab.id} onClick={() => onTabChange(tab.id)} className={`nav-item ${activeTab === tab.id ? "active" : ""}`} style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.id === "notifications" && unreadCount > 0 && <span className="notification-dot" />}
            </div>
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

// ==================== MAIN APP ====================
export default function CampusApp() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login");
  const [showLanding, setShowLanding] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    localStorage.removeItem("campus_users");
    localStorage.removeItem("campus_current_user");
    localStorage.setItem("campus_app_version", "v2");

    const saved = localStorage.getItem("campus_current_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        setPosts(INITIAL_POSTS);
        setMessages(INITIAL_MESSAGES);
        setNotifications(INITIAL_NOTIFICATIONS);
        setShowLanding(false);
      } catch (e) {
        console.error("Failed to load saved user:", e);
        localStorage.removeItem("campus_current_user");
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("campus_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("campus_current_user");
    }
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    setPosts([]);
    setMessages([]);
    setNotifications([]);
    setActiveTab("home");
    setAuthScreen("login");
    setShowLanding(true);
  };

  const ctxValue: AppContextType = {
    currentUser, setCurrentUser,
    posts, setPosts,
    messages, setMessages,
    notifications, setNotifications,
    logout
  };

  const renderScreen = () => {
    if (showLanding) {
      return <LandingScreen onGetStarted={() => setShowLanding(false)} />;
    }
    if (!currentUser) {
      return authScreen === "login"
        ? <LoginScreen onSwitch={() => setAuthScreen("signup")} />
        : <SignupScreen onSwitch={() => setAuthScreen("login")} />;
    }
    if (showCreatePost) {
      return <CreatePostScreen onBack={() => setShowCreatePost(false)} />;
    }
    switch (activeTab) {
      case "home": return <HomeFeed onCreatePost={() => setShowCreatePost(true)} />;
      case "messages": return <MessagesScreen />;
      case "notifications": return <NotificationsScreen />;
      case "profile": return <ProfileScreen />;
      default: return <HomeFeed onCreatePost={() => setShowCreatePost(true)} />;
    }
  };

  return (
    <AppContext.Provider value={ctxValue}>
      <div style={{ minHeight: "100vh", background: "#0f1115", paddingBottom: currentUser ? 80 : 0 }}>
        {currentUser && (
          <header className="header-bar" style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {activeTab === "home" && (
                <button onClick={() => setShowCreatePost(true)} className="campus-btn campus-btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
                  <Plus size={16} /> Post Skill
                </button>
              )}
              <Avatar name={currentUser.name} size={36} src={currentUser.avatarUrl} />
            </div>
          </header>
        )}
        <main>{renderScreen()}</main>
        {currentUser && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      </div>
    </AppContext.Provider>
  );
}