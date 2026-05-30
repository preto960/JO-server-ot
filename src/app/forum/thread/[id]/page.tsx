'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { ArrowLeft, Send, Pin, Lock, MessageCircle, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumPostData {
  id: number;
  postText: string;
  author: string;
  player: { name: string; level: number; vocation: number } | null;
  postDate: number;
  isEdited: boolean;
  editDate: number;
}

interface ThreadDetailData {
  id: number;
  postTopic: string;
  section: number;
  author: string;
  postDate: number;
  replies: number;
  views: number;
  sticked: boolean;
  closed: boolean;
  posts: ForumPostData[];
}

export default function ForumThreadPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params.id as string;

  const [thread, setThread] = useState<ThreadDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setThread(null);
    setError('');
    fetch(`/api/forum/thread/${threadId}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.success) setThread(data.data);
        else setError(data.error || 'Hilo no encontrado');
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar el hilo');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [threadId]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/forum/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: parseInt(threadId), content: replyContent }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyContent('');
        setMessage({ type: 'success', text: '¡Respuesta publicada!' });
        // Re-fetch thread
        setLoading(true);
        fetch(`/api/forum/thread/${threadId}`)
          .then(r => r.json())
          .then(data => { if (data.success) setThread(data.data); })
          .finally(() => setLoading(false));
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al responder.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    }
    setReplyLoading(false);
  };

  if (loading) return <Loading text="Cargando hilo..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 text-center">
        <EmptyState title={error} />
        <Button variant="outline" onClick={() => router.push('/forum')} className="mt-4 border-amber-500/20">
          Volver al foro
        </Button>
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      {/* Navigation */}
      <Button variant="ghost" onClick={() => router.push('/forum')} className="text-muted-foreground hover:text-amber-400">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al foro
      </Button>

      {/* Thread Header */}
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {thread.sticked && <Pin className="h-4 w-4 text-amber-500" />}
            {thread.closed && <Lock className="h-4 w-4 text-red-400" />}
            <CardTitle className="text-xl">{thread.postTopic}</CardTitle>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>por {thread.author}</span>
            <span>{formatDistanceToNow(new Date(thread.postDate * 1000), { addSuffix: true })}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {thread.replies}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {thread.views}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Message */}
      {message && (
        <div className={`rounded-md px-4 py-2 text-sm ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Posts */}
      {thread.posts.map((post, index) => (
        <Card key={post.id} className="border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Author */}
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <User className="h-5 w-5 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-foreground">{post.author}</span>
                {post.player && (
                  <span className="text-xs text-muted-foreground">Lv {post.player.level}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.postDate * 1000), { addSuffix: true })}
                </span>
                {index === 0 && (
                  <Badge variant="outline" className="border-amber-500/20 text-amber-500 text-[10px]">
                    OP
                  </Badge>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="rounded-md bg-[#1a1a2e] p-4 text-sm text-foreground whitespace-pre-wrap">
                  {post.postText}
                </div>
                {post.isEdited && (
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    Editado {formatDistanceToNow(new Date(post.editDate * 1000), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Reply Form */}
      {!thread.closed && (
        <Card className="border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Responder</h3>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="min-h-[100px] border-amber-500/20 bg-[#1a1a2e] placeholder:text-muted-foreground/50"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={replyLoading || !replyContent.trim()}
                className="bg-amber-500 text-black hover:bg-amber-400"
              >
                <Send className="mr-2 h-4 w-4" />
                {replyLoading ? 'Enviando...' : 'Responder'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {thread.closed && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Este hilo está cerrado. No se pueden publicar nuevas respuestas.
        </div>
      )}
    </div>
  );
}
