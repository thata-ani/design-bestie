"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import dynamic from 'next/dynamic';
import WinnerCertificate from '@/components/battle/WinnerCertificate';

const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);

type Battle = {
  id: string;
  slug: string;
  creator_id: string;
  creator_name: string;
  creator_image_url: string;
  challenger_id: string | null;
  challenger_name: string | null;
  challenger_image_url: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  winner: string | null;
  created_at: string;
};

type Message = {
  id: string;
  battle_id: string;
  role: string;
  content: string;
  created_at: string;
};

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [battle, setBattle] = useState<Battle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [defense, setDefense] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [challengerFile, setChallengerFile] = useState<File | null>(null);
  const [challengerPreview, setChallengerPreview] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const roastStartedRef = useRef(false);

  // Helper functions
  const cleanContent = (text: string) => text.replace(/^#\s*.+?\n/, '').trim();
  const truncate = (text: string, max = 160) => text.length > max ? text.slice(0, max) + '...' : text;
  const creatorScore = battle?.winner === 'creator' ? 7 : 4;
  const challengerScore = battle?.winner === 'challenger' ? 7 : 4;
  const roastMessages = messages.filter(m => !m.content.includes('WINNER:'));

  const toggleExpand = (id: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    loadBattle();
    loadMessages();

    // Poll for updates every 2 seconds
    pollRef.current = setInterval(() => {
      loadBattle();
      loadMessages();
    }, 2000);

    // Get current user
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slug]);

  // Start timer when it's user's turn
  useEffect(() => {
    if (battle && battle.status === 'in_progress' && isUserTurn()) {
      setTimeLeft(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [battle, messages, currentUserId]);

  const loadBattle = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Battle fetch error:', error);
    } else {
      setBattle(data);
      await loadMessages(data.id);

      // Auto-start roast sequence
      if (data.status === 'in_progress' && messages.length === 0 && !roastStartedRef.current) {
        roastStartedRef.current = true;
        try {
          // Roast creator first, wait for it
          await fetch('/api/battle/roast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, target: 'creator' }),
          });
          await loadMessages();

          // Then roast challenger, wait for it
          await fetch('/api/battle/roast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, target: 'challenger' }),
          });
          await loadMessages();

          // Small delay then verdict
          await new Promise(resolve => setTimeout(resolve, 2000));

          await fetch('/api/battle/verdict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
          });
          await loadMessages();
        } catch (err) {
          console.error('Auto-roast error:', err);
        }
      }
    }
    setLoading(false);
  };

  const loadMessages = async (battleId?: string) => {
    const id = battleId || battle?.id;
    if (!id) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('battle_messages')
      .select('*')
      .eq('battle_id', id)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
  };

  const isUserTurn = () => {
    if (!battle || !currentUserId) return false;
    const lastMessage = messages[messages.length - 1];

    // If no messages or last message was AI, it's not user's turn yet
    if (!lastMessage || lastMessage.role === 'ai') return false;

    // Check if it's creator or challenger's turn to defend
    const isCreator = currentUserId === battle.creator_id;
    const isChallenger = currentUserId === battle.challenger_id;

    // Simple turn logic: after AI roast, user can defend
    return (isCreator || isChallenger);
  };

  const handleDefend = async () => {
    if (!defense.trim() || !battle || !currentUserId) return;

    setIsSubmitting(true);
    const role = currentUserId === battle.creator_id ? 'creator' : 'challenger';

    try {
      const response = await fetch('/api/battle/defend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, defense, role }),
      });

      if (response.ok) {
        setDefense('');
        loadMessages();
      }
    } catch (error) {
      console.error('Defend error:', error);
    }
    setIsSubmitting(false);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/battle/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Battle link copied to clipboard!');
  };

  const handleChallengerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChallengerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setChallengerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoinBattle = async () => {
    if (!challengerFile || !challengerPreview) return;

    setIsJoining(true);
    try {
      // Convert to base64
      const base64Match = challengerPreview.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!base64Match) {
        alert('Invalid image format');
        return;
      }

      const mimeType = base64Match[1];
      const imageBase64 = base64Match[2];

      const response = await fetch('/api/battle/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          imageBase64,
          mimeType,
          challengerName: 'Challenger',
        }),
      });

      if (response.ok) {
        loadBattle();
        loadMessages();
      } else {
        alert('Failed to join battle');
      }
    } catch (error) {
      console.error('Join error:', error);
      alert('Failed to join battle');
    }
    setIsJoining(false);
  };

  if (loading) return (
    <div style={{ height: '100vh', background: '#08090F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading battle...</div>
  );

  if (!battle) return (
    <div style={{ height: '100vh', background: '#08090F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Battle not found</div>
  );

  // Waiting — creator view
  if (battle.status === 'waiting' && currentUserId === battle.creator_id) return (
    <div style={{ height: '100vh', background: '#08090F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '16px' }}>
      <Player autoplay loop src="/battle-waiting.json" style={{ width: '180px', height: '180px' }} />
      <h2 style={{ fontSize: '20px', margin: 0 }}>Waiting for challenger...</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Share this link to start the battle</p>
      <button onClick={copyLink} style={{ background: '#5a47b0', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>📋 Copy Battle Link</button>
    </div>
  );

  // Waiting — challenger view
  if (battle.status === 'waiting' && currentUserId !== battle.creator_id) return (
    <div style={{ minHeight: '100vh', background: '#08090F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '24px', gap: '16px' }}>
      <Player autoplay loop src="/battle-starting.json" style={{ width: '140px', height: '140px' }} />
      <h2 style={{ fontSize: '22px', margin: 0 }}>You've been challenged!</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Upload your design to battle</p>
      <input type="file" accept="image/*" onChange={handleChallengerFileChange} style={{ display: 'none' }} id="challenger-upload" />
      <label htmlFor="challenger-upload" style={{ display: 'block', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '32px 48px', cursor: 'pointer', textAlign: 'center' }}>
        {challengerPreview ? <img src={challengerPreview} alt="Preview" style={{ maxWidth: '280px', borderRadius: '8px' }} /> : <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>📁 Click to upload your design</div>}
      </label>
      <button onClick={handleJoinBattle} disabled={isJoining || !challengerFile} style={{ background: isJoining || !challengerFile ? '#333' : '#5a47b0', border: 'none', color: '#fff', padding: '14px 32px', borderRadius: '8px', cursor: isJoining || !challengerFile ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600 }}>
        {isJoining ? 'Joining...' : '⚔️ Join Battle'}
      </button>
    </div>
  );

  // In progress + completed
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', color: '#333' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', overflow: 'hidden', marginTop: '24px', marginBottom: '24px' }}>

        {/* Header */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '1px solid #e5e5e5', color: '#333', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>← Back</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#333', letterSpacing: '2px' }}>⚔️ DESIGN ROAST BATTLE</div>
          <div style={{ width: '70px' }} />
        </div>

        {/* Scoreboard */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '28px', padding: '14px', background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#7c3aed', lineHeight: 1 }}>{creatorScore}</div>
            <div style={{ fontSize: '8px', color: '#888', letterSpacing: '1px', marginTop: '2px' }}>YOU</div>
          </div>
          <div style={{ fontSize: '10px', color: '#ccc', letterSpacing: '2px' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ccc', lineHeight: 1 }}>{challengerScore}</div>
            <div style={{ fontSize: '8px', color: '#888', letterSpacing: '1px', marginTop: '2px' }}>CHALLENGER</div>
          </div>
        </div>

        {/* Fighter cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px 16px', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ border: battle.winner === 'creator' ? '2px solid #7c3aed' : '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden', position: 'relative', boxShadow: battle.winner === 'creator' ? '0 0 16px rgba(124,58,237,0.2)' : 'none', opacity: battle.winner && battle.winner !== 'creator' ? 0.4 : 1, filter: battle.winner && battle.winner !== 'creator' ? 'grayscale(60%)' : 'none', transition: 'all 0.5s' }}>
            <img src={battle.creator_image_url} alt="Your design" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
            {battle.winner === 'creator' && <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#7c3aed', color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>👑 WINNER</div>}
            <div style={{ background: '#fafafa', padding: '5px', textAlign: 'center', fontSize: '8px', color: '#7c3aed', letterSpacing: '2px', fontWeight: 600 }}>YOU</div>
          </div>
          <div style={{ border: battle.winner === 'challenger' ? '2px solid #7c3aed' : '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden', position: 'relative', boxShadow: battle.winner === 'challenger' ? '0 0 16px rgba(124,58,237,0.2)' : 'none', opacity: battle.winner && battle.winner !== 'challenger' ? 0.4 : 1, filter: battle.winner && battle.winner !== 'challenger' ? 'grayscale(60%)' : 'none', transition: 'all 0.5s' }}>
            {battle.challenger_image_url && <img src={battle.challenger_image_url} alt="Challenger" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />}
            {battle.winner === 'challenger' && <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#7c3aed', color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>👑 WINNER</div>}
            <div style={{ background: '#fafafa', padding: '5px', textAlign: 'center', fontSize: '8px', color: '#888', letterSpacing: '2px', fontWeight: 600 }}>CHALLENGER</div>
          </div>
        </div>

        {/* Chat */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Battle starting lottie */}
          {roastMessages.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: '#f3f4f6', borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Player autoplay loop={false} src="/battle-starting.json" style={{ width: '28px', height: '28px' }} />
                <span style={{ fontSize: '9px', color: '#999', letterSpacing: '1px' }}>Battle started</span>
              </div>
            </div>
          )}

          {/* Roast messages — only first 2 */}
          {roastMessages.slice(0, 2).map((msg, i) => {
            const isLeft = i === 0;
            const isExpanded = expandedMessages.has(msg.id);
            const needsTruncation = cleanContent(msg.content).length > 160;
            const displayText = isExpanded ? cleanContent(msg.content) : truncate(cleanContent(msg.content));
            return (
              <div key={msg.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isLeft ? 'flex-start' : 'flex-end', gap: '6px', marginBottom: '6px' }}>
                  {isLeft && <Player autoplay loop={false} src="/battle-roasting.json" style={{ width: '24px', height: '24px' }} />}
                  <span style={{ fontSize: '9px', color: '#999', letterSpacing: '1px' }}>battle-roasting.json</span>
                  {!isLeft && <Player autoplay loop={false} src="/battle-roasting.json" style={{ width: '24px', height: '24px' }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexDirection: isLeft ? 'row' : 'row-reverse' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLeft ? '#ef4444' : '#7c3aed', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ maxWidth: '75%', ...(isLeft ? {} : { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' }) }}>
                    <div style={{ fontSize: '8px', color: isLeft ? '#ef4444' : '#7c3aed', letterSpacing: '1px', marginBottom: '5px', fontWeight: 600 }}>
                      {isLeft ? 'ROASTING YOU 🔥' : 'ROASTING CHALLENGER 🔥'}
                    </div>
                    <div style={{ background: isLeft ? 'rgba(239,68,68,0.08)' : 'rgba(167,139,250,0.08)', border: `1px solid ${isLeft ? 'rgba(239,68,68,0.2)' : 'rgba(167,139,250,0.2)'}`, borderRadius: isLeft ? '4px 12px 12px 12px' : '12px 4px 12px 12px', padding: '10px 14px', fontSize: '12px', color: '#333', lineHeight: 1.6 }}>
                      {displayText}
                      {needsTruncation && (
                        <span
                          onClick={() => toggleExpand(msg.id)}
                          style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: isLeft ? '#ef4444' : '#7c3aed', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {isExpanded ? 'show less ↑' : 'read more ↓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Verdict lottie - only show once when completed */}
          {battle.status === 'completed' && roastMessages.length >= 2 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: '#f3f4f6', borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Player autoplay loop={false} src="/battle-verdict.json" style={{ width: '28px', height: '28px' }} />
                <span style={{ fontSize: '9px', color: '#999', letterSpacing: '1px' }}>Calculating verdict...</span>
              </div>
            </div>
          )}

          {/* Winner/loser lotties */}
          {battle.status === 'completed' && battle.winner && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <Player autoplay loop src={battle.winner === 'creator' ? '/battle-winner.json' : '/battle-loser.json'} style={{ width: '80px', height: '80px', margin: '0 auto' }} />
              </div>
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <Player autoplay loop src={battle.winner === 'challenger' ? '/battle-winner.json' : '/battle-loser.json'} style={{ width: '80px', height: '80px', margin: '0 auto' }} />
              </div>
            </div>
          )}

          {/* Final verdict */}
          {battle.status === 'completed' && battle.winner && (
            <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #fef3c7)', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>FINAL VERDICT</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#7c3aed', marginBottom: '8px' }}>
                {battle.winner === 'creator' ? 'YOU WIN 🏆' : 'CHALLENGER WINS 🏆'}
              </div>
              <div style={{ fontSize: '11px', color: '#666', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.7 }}>
                {messages.find(m => m.content.includes('WINNER:'))?.content.replace(/WINNER:\s*(creator|challenger)\s*/i, '').replace(/REASON:\s*/i, '').trim()}
              </div>
              <button onClick={() => setShowCertificate(true)} style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                🏆 Get Victory Certificate
              </button>
            </div>
          )}

          {/* Loading state */}
          {battle.status === 'in_progress' && roastMessages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
              <Player autoplay loop src="/battle-roasting.json" style={{ width: '100px', height: '100px' }} />
              <div style={{ fontSize: '13px', color: '#999' }}>AI is roasting both designs...</div>
            </div>
          )}

        </div>
      </div>

      {showCertificate && <WinnerCertificate battle={battle} onClose={() => setShowCertificate(false)} />}
    </div>
  );
}
