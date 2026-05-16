'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Plus,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Reply = {
  id: string;
  content: string;
  author: { id: string; name?: string; fullName?: string; role: string };
  createdAt: string;
};

type Discussion = {
  id: string;
  title: string;
  content: string;
  author: { id: string; name?: string; fullName?: string; role: string };
  projectId?: { id: string; title: string } | null;
  replies: Reply[];
  createdAt: string;
};

function formatTime(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function roleBadgeColor(role: string) {
  if (role === 'teacher') return 'bg-emerald-100 text-emerald-700';
  if (role === 'admin') return 'bg-purple-100 text-purple-700';
  return 'bg-blue-100 text-blue-700';
}

export default function DiscussionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState<string | null>(null);

  const { data, isLoading } = useSWR('/discussions', fetcher);
  const discussions: Discussion[] = data?.data ?? [];

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and content are required.' });
      return;
    }
    setIsCreating(true);
    try {
      await api.post('/discussions', { title: newTitle.trim(), content: newContent.trim() });
      mutate('/discussions');
      setShowNewDialog(false);
      setNewTitle('');
      setNewContent('');
      toast({ title: 'Posted', description: 'Your discussion has been created.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to post.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsCreating(false);
    }
  };

  const handleReply = async (discussionId: string) => {
    const content = (replyContent[discussionId] ?? '').trim();
    if (!content) return;
    setIsReplying(discussionId);
    try {
      await api.post(`/discussions/${discussionId}/replies`, { content });
      mutate('/discussions');
      setReplyContent((prev) => ({ ...prev, [discussionId]: '' }));
      toast({ title: 'Reply posted.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to post reply.' });
    } finally {
      setIsReplying(null);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>
            <p className="text-muted-foreground">
              Communicate with your advisor and share project updates.
            </p>
          </div>
          <Button className="rounded-full gap-2" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4" /> New Discussion
          </Button>
        </div>

        {/* Discussion list */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : discussions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No discussions yet</h2>
              <p className="text-muted-foreground text-sm">
                Start a discussion to communicate with your advisor or team.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((d) => {
              const authorName = d.author.name ?? d.author.fullName ?? 'Unknown';
              const isExpanded = expandedId === d.id;
              const isMe = d.author.id === user?.id;

              return (
                <Card key={d.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{authorName}</span>
                            {isMe && <Badge variant="outline" className="text-[10px] py-0">You</Badge>}
                            <Badge className={`text-[10px] py-0 border-0 ${roleBadgeColor(d.author.role)}`}>
                              {d.author.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            {formatTime(d.createdAt)}
                            {d.projectId?.title && (
                              <> · <span className="font-medium">{d.projectId.title}</span></>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs gap-1"
                        onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {d.replies.length}
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <CardTitle className="text-base mt-2">{d.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.content}</p>

                    {/* Replies */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        {d.replies.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            No replies yet. Be the first to reply.
                          </p>
                        ) : (
                          d.replies.map((r) => {
                            const replyName = r.author.name ?? r.author.fullName ?? 'Unknown';
                            return (
                              <div key={r.id} className="flex gap-3">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                    {getInitials(replyName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold">{replyName}</span>
                                    <Badge className={`text-[10px] py-0 border-0 ${roleBadgeColor(r.author.role)}`}>
                                      {r.author.role}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground ml-auto">{formatTime(r.createdAt)}</span>
                                  </div>
                                  <p className="text-sm">{r.content}</p>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* Reply input */}
                        <div className="flex gap-2 pt-1">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {getInitials(user?.name ?? 'Me')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-1 gap-2">
                            <Input
                              placeholder="Write a reply..."
                              className="h-9 text-sm rounded-full"
                              value={replyContent[d.id] ?? ''}
                              onChange={(e) =>
                                setReplyContent((prev) => ({ ...prev, [d.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReply(d.id);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              className="rounded-full px-3"
                              disabled={isReplying === d.id || !(replyContent[d.id] ?? '').trim()}
                              onClick={() => handleReply(d.id)}
                            >
                              {isReplying === d.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />
                              }
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* New Discussion Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              New Discussion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="What would you like to discuss?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Provide more details..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full gap-2"
              onClick={handleCreate}
              disabled={isCreating || !newTitle.trim() || !newContent.trim()}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post Discussion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
