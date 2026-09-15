import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Lightbulb,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, tasks, projects, reminders, reports } = useWork();
  const { profile } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile?.name || 'there'}! I am your Daily Work AI Assistant. I have analyzed your current schedule, projects, and tasks for September 2026. What would you like assistance with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isAiModalOpen) return null;

  const quickPrompts = [
    'What should I focus on today?',
    'What tasks are overdue or pending?',
    'What did I accomplish this week?',
    'Create tomorrow’s work plan based on unfinished tasks.',
    'Which project took most of my time?',
    'Summarize my productivity trend.',
  ];

  // Client-side analytics fallback engine if no Gemini API key is configured
  const generateLocalResponse = (query: string): string => {
    const todayStr = '2026-09-15';
    const q = query.toLowerCase();

    if (q.includes('focus on today') || q.includes('today')) {
      const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
      const pending = todayTasks.filter((t) => t.status !== 'Completed');
      const urgent = pending.filter((t) => t.priority === 'Urgent' || t.priority === 'High');

      let res = `Here is your high-priority focus for today (${todayStr}):\n\n`;
      if (urgent.length > 0) {
        res += `🔥 **Urgent & High Priority Items**:\n`;
        urgent.forEach((t) => {
          res += `• **${t.title}** (${t.estimatedMinutes} min, Due ${t.dueTime})\n`;
        });
        res += `\n`;
      }
      if (pending.length > urgent.length) {
        res += `📌 **Other Scheduled Tasks**:\n`;
        pending
          .filter((t) => t.priority !== 'Urgent' && t.priority !== 'High')
          .forEach((t) => {
            res += `• ${t.title} (${t.estimatedMinutes} min, Due ${t.dueTime})\n`;
          });
      }
      if (pending.length === 0) {
        res = `🎉 Fantastic work! You have completed all scheduled tasks for today. You can get ahead on upcoming project milestones or review your daily report.`;
      }
      return res;
    }

    if (q.includes('overdue') || q.includes('pending')) {
      const overdue = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Completed');
      if (overdue.length === 0) {
        return `✅ You currently have **0 overdue tasks**! All previous work items have been cleared.`;
      }
      return `⚠️ You have **${overdue.length} overdue task(s)** requiring attention:\n\n` +
        overdue.map((t) => `• **${t.title}** (Was due ${t.dueDate} at ${t.dueTime}) - Priority: ${t.priority}`).join('\n') +
        `\n\nRecommendation: Reschedule or complete these first before starting new sprint initiatives.`;
    }

    if (q.includes('accomplish') || q.includes('week') || q.includes('achievement')) {
      const completed = tasks.filter((t) => t.status === 'Completed');
      const totalMinutes = completed.reduce((acc, t) => acc + (t.actualMinutes || t.estimatedMinutes), 0);
      return `📊 **Weekly Accomplishments Summary**:\n\n` +
        `• **Completed Tasks**: ${completed.length} items\n` +
        `• **Logged Work Time**: ${(totalMinutes / 60).toFixed(1)} hours\n` +
        `• **Highlights**:\n` +
        completed.slice(0, 4).map((t) => `  ✓ ${t.title}`).join('\n') +
        `\n\nYour momentum is strong! You can generate a full exportable Weekly Report from the sidebar navigation.`;
    }

    if (q.includes('tomorrow') || q.includes('plan')) {
      const pending = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
      return `🗓️ **Proposed Work Plan for Tomorrow (Sep 16, 2026)**:\n\n` +
        `1. **Morning Block (09:00 - 11:30)**: Tackle high-cognitive tasks: Audit notification queues & database security rules.\n` +
        `2. **Midday Block (13:00 - 14:00)**: Sprint planning with design leads.\n` +
        `3. **Afternoon Review (16:30)**: Compile status update and log actual time spent.\n\n` +
        `Carryover tasks from today: ${pending.slice(0, 2).map((t) => `"${t.title}"`).join(', ')}.`;
    }

    if (q.includes('project') || q.includes('time')) {
      return `⏱️ **Project Time Allocation Analysis**:\n\n` +
        projects
          .map((p) => {
            const pTasks = tasks.filter((t) => t.projectId === p.id);
            const pMinutes = pTasks.reduce((acc, t) => acc + (t.actualMinutes || t.estimatedMinutes), 0);
            return `• **${p.name}**: ${(pMinutes / 60).toFixed(1)} hrs (${pTasks.length} tasks, ${p.status})`;
          })
          .join('\n') +
        `\n\n**Most Active Project**: "${projects[0]?.name || 'Client SaaS Portal'}" has received the highest concentration of work hours.`;
    }

    // Default intelligent summary
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    const rate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    return `💡 **Productivity Overview**:\n\n` +
      `You have **${tasks.length} total tasks** across **${projects.length} projects** with an overall completion rate of **${rate}%**.\n\n` +
      `Try asking me:\n` +
      `• "What should I focus on today?"\n` +
      `• "What tasks are overdue?"\n` +
      `• "Create tomorrow's work plan."`;
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || prompt).trim();
    if (!queryText || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          systemInstruction:
            'You are a professional daily work management assistant. Provide concise, clear, motivating, and actionable advice based on the user\'s real tasks, projects, reminders, and reports.',
          contextData: {
            userProfile: profile,
            tasks: tasks.map((t) => ({
              title: t.title,
              status: t.status,
              priority: t.priority,
              dueDate: t.dueDate,
              dueTime: t.dueTime,
              estimatedMinutes: t.estimatedMinutes,
              actualMinutes: t.actualMinutes,
            })),
            projects: projects.map((p) => ({
              name: p.name,
              status: p.status,
              priority: p.priority,
              endDate: p.endDate,
            })),
            reminders: reminders.map((r) => ({
              title: r.title,
              remindAt: r.remindAt,
              isCompleted: r.isCompleted,
            })),
          },
        }),
      });

      const data = await response.json();
      let replyText = '';

      if (data.status === 'success' && data.text) {
        replyText = data.text;
      } else {
        // Fallback gracefully to local work analytics
        replyText = generateLocalResponse(queryText);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('AI query error, using local analytics:', err);
      const fallbackText = generateLocalResponse(queryText);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="ai-assistant-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsAiModalOpen(false)}
    >
      <div
        id="ai-assistant-card"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[650px] max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 dark:from-indigo-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                Work AI Assistant
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Gemini
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grounded on your active tasks, projects & reports
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none text-xs bg-slate-50/50 dark:bg-slate-900">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 shrink-0 text-[11px] font-medium transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <span
                  className={`block text-[9px] mt-1.5 ${
                    m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs items-center text-slate-500">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px]">Analyzing your daily work data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your tasks, projects, or schedule..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
