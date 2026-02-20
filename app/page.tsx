'use client'

import React, { useState, useRef, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  RiSendPlaneFill,
  RiTelegramFill,
  RiRocketFill,
  RiKey2Fill,
  RiEyeFill,
  RiEyeOffFill,
  RiCheckFill,
  RiCloseFill,
  RiLoader4Fill,
  RiExternalLinkLine,
  RiGlobalLine,
  RiCpuLine,
  RiMenuLine,
  RiCloseLine,
  RiCheckboxCircleFill,
  RiChat3Fill,
  RiDiscordFill,
  RiWhatsappFill,
  RiServerFill,
  RiTerminalBoxFill,
  RiLockFill,
  RiCodeSSlashFill,
  RiSettings3Fill,
  RiHeartPulseFill,
  RiFileCopyFill,
  RiArrowRightSLine,
} from 'react-icons/ri'
import {
  SiAnthropic,
  SiOpenai,
  SiGoogle,
} from 'react-icons/si'

// ---------- Constants ----------
const AGENT_ID = '699889aa2407a74739486500'

interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

interface ModelOption {
  id: string
  name: string
  provider: string
  iconType: string
}

interface ChannelOption {
  id: string
  name: string
  available: boolean
}

const MODELS: ModelOption[] = [
  { id: 'claude-opus', name: 'Claude Opus 4', provider: 'Anthropic', iconType: 'anthropic' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', iconType: 'openai' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', iconType: 'google' },
  { id: 'mistral', name: 'Mistral', provider: 'Mistral AI', iconType: 'mistral' },
  { id: 'llama', name: 'Llama 3', provider: 'Meta', iconType: 'meta' },
]

const CHANNELS: ChannelOption[] = [
  { id: 'telegram', name: 'Telegram', available: true },
  { id: 'discord', name: 'Discord', available: false },
  { id: 'whatsapp', name: 'WhatsApp', available: false },
]

const COMPARISON_ROWS = [
  { feature: 'Any AI Model', simpleclaw: true, others: false },
  { feature: 'Your Own API Key', simpleclaw: true, others: false },
  { feature: '60-Second Deploy', simpleclaw: true, others: false },
  { feature: 'Telegram Native', simpleclaw: true, others: false },
  { feature: 'Auto-Healing', simpleclaw: true, others: false },
  { feature: 'Private Container', simpleclaw: true, others: false },
  { feature: 'No Vendor Lock-in', simpleclaw: true, others: false },
]

const PIPELINE_STEPS = [
  'Visit',
  'Select Model',
  'API Key',
  'Telegram',
  'Auth',
  'Deploy',
  'Payment',
  'Activation',
  'Pairing',
  'Chatting',
]

const SAMPLE_CHAT: ChatMessage[] = [
  { role: 'user', content: 'Hello! Can you tell me about machine learning?' },
  { role: 'bot', content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.\n\nThere are three main types:\n- **Supervised learning** - learns from labeled data\n- **Unsupervised learning** - finds patterns in unlabeled data\n- **Reinforcement learning** - learns through trial and reward' },
  { role: 'user', content: 'What is supervised learning?' },
  { role: 'bot', content: 'Supervised learning is a type of machine learning where the model is trained on **labeled data**. The algorithm learns from example input-output pairs to predict outputs for new, unseen inputs.\n\nCommon applications include:\n- Image classification\n- Spam detection\n- Price prediction\n- Medical diagnosis' },
]

const ARCHITECTURE_CARDS = [
  {
    title: 'The Gateway',
    description: 'Frontend & API layer with encrypted config storage. Secure sign-in and session management.',
    icon: 'gateway',
  },
  {
    title: 'The Orchestrator',
    description: 'Payment processing via Polar.sh, webhook handlers, and job queue for deployment coordination.',
    icon: 'orchestrator',
  },
  {
    title: 'Pre-configured VM',
    description: 'Snapshot cloning for under-60-second deploys. Always-ready virtual machines standing by.',
    icon: 'vm',
  },
  {
    title: 'The Brain (OpenClaw)',
    description: 'Docker isolation per user, direct config injection, auto-healing watchdog, and graceful recovery.',
    icon: 'brain',
  },
]

const FEATURES = [
  { icon: 'container', title: 'Container Isolation', desc: 'Every bot runs in its own Docker container. Complete isolation and security by default.' },
  { icon: 'healing', title: 'Auto-Healing', desc: 'Watchdog process monitors your bot 24/7. Automatic restart on crash with zero downtime.' },
  { icon: 'snapshot', title: 'Snapshot Cloning', desc: 'Pre-built VM snapshots enable deployment in under 60 seconds. No cold starts.' },
  { icon: 'config', title: 'Direct Config', desc: 'Your API keys are injected directly into the container. No middleman, no proxy fees.' },
  { icon: 'multimodel', title: 'Multi-Model Support', desc: 'Switch between OpenAI, Anthropic, Google, Mistral, and Meta models freely.' },
  { icon: 'privacy', title: 'Full Privacy', desc: 'Your data stays in your container. No logging, no training on your conversations.' },
]

// ---------- Helpers ----------

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function getModelIcon(iconType: string) {
  switch (iconType) {
    case 'anthropic':
      return <SiAnthropic className="w-4 h-4" />
    case 'openai':
      return <SiOpenai className="w-4 h-4" />
    case 'google':
      return <SiGoogle className="w-4 h-4" />
    case 'mistral':
      return <RiCpuLine className="w-4 h-4" />
    case 'meta':
      return <RiCodeSSlashFill className="w-4 h-4" />
    default:
      return <RiCpuLine className="w-4 h-4" />
  }
}

function getChannelIcon(id: string) {
  switch (id) {
    case 'telegram':
      return <RiTelegramFill className="w-5 h-5" />
    case 'discord':
      return <RiDiscordFill className="w-5 h-5" />
    case 'whatsapp':
      return <RiWhatsappFill className="w-5 h-5" />
    default:
      return <RiGlobalLine className="w-5 h-5" />
  }
}

function getArchitectureIcon(icon: string) {
  switch (icon) {
    case 'gateway':
      return <RiGlobalLine className="w-6 h-6 text-primary" />
    case 'orchestrator':
      return <RiSettings3Fill className="w-6 h-6 text-primary" />
    case 'vm':
      return <RiServerFill className="w-6 h-6 text-primary" />
    case 'brain':
      return <RiTerminalBoxFill className="w-6 h-6 text-primary" />
    default:
      return <RiCpuLine className="w-6 h-6 text-primary" />
  }
}

function getFeatureIcon(icon: string) {
  switch (icon) {
    case 'container':
      return <RiServerFill className="w-6 h-6 text-primary" />
    case 'healing':
      return <RiHeartPulseFill className="w-6 h-6 text-primary" />
    case 'snapshot':
      return <RiFileCopyFill className="w-6 h-6 text-primary" />
    case 'config':
      return <RiKey2Fill className="w-6 h-6 text-primary" />
    case 'multimodel':
      return <RiCpuLine className="w-6 h-6 text-primary" />
    case 'privacy':
      return <RiLockFill className="w-6 h-6 text-primary" />
    default:
      return <RiCpuLine className="w-6 h-6 text-primary" />
  }
}

// ---------- ErrorBoundary ----------

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------- Main Page Component ----------

export default function Page() {
  // All-in-one form state (NOT multi-step)
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('telegram')
  const [apiKey, setApiKey] = useState('')
  const [telegramToken, setTelegramToken] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDeployed, setIsDeployed] = useState(false)
  const [deployError, setDeployError] = useState('')

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Pipeline tracking
  const [pipelineStep, setPipelineStep] = useState(1)

  // UI state
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Refs
  const deployRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Derive pipeline step from form state
  useEffect(() => {
    if (isDeployed) {
      setPipelineStep(10)
      return
    }
    if (isDeploying) return
    let step = 1
    if (selectedModel) step = 2
    if (selectedModel && apiKey.length >= 10) step = 3
    if (selectedModel && apiKey.length >= 10 && /^\d+:[A-Za-z0-9_-]+$/.test(telegramToken)) step = 4
    setPipelineStep(step)
  }, [selectedModel, apiKey, telegramToken, isDeployed, isDeploying])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, isSending])

  // Sample data toggle
  useEffect(() => {
    if (showSampleData) {
      setSelectedModel('claude-opus')
      setSelectedChannel('telegram')
      setApiKey('sk-ant-abcdefghijklmnopqrstuvwxyz1234567890')
      setTelegramToken('6123456789:AAHnDq2w5xK9qM3jL7vB8cR4fY1zP0sE2uW')
      setIsDeployed(true)
      setChatMessages(SAMPLE_CHAT)
      setDeployError('')
    } else {
      setSelectedModel('')
      setSelectedChannel('telegram')
      setApiKey('')
      setTelegramToken('')
      setIsDeployed(false)
      setChatMessages([])
      setChatInput('')
      setDeployError('')
    }
  }, [showSampleData])

  // Form validation
  const isModelValid = selectedModel !== ''
  const isApiKeyValid = apiKey.length >= 10
  const isTokenValid = /^\d+:[A-Za-z0-9_-]+$/.test(telegramToken)
  const canDeploy = isModelValid && isApiKeyValid && isTokenValid && !isDeploying

  const handleDeploy = async () => {
    setIsDeploying(true)
    setPipelineStep(5)
    setDeployError('')
    setActiveAgentId(AGENT_ID)
    try {
      const model = MODELS.find((m) => m.id === selectedModel)
      const message = `Deploy a Telegram bot using ${model?.name ?? selectedModel} model. Test connectivity and confirm deployment is ready.`

      setPipelineStep(6)
      const result = await callAIAgent(message, AGENT_ID)

      if (result.success) {
        setPipelineStep(10)
        setIsDeployed(true)
        const responseText = result?.response?.result?.response_text ?? result?.response?.message ?? ''
        if (responseText) {
          setChatMessages([{ role: 'bot', content: responseText }])
        }
      } else {
        setDeployError(result?.error ?? 'Deployment failed.')
        setPipelineStep(6)
        setIsDeployed(true)
      }
    } catch {
      setDeployError('An unexpected error occurred.')
      setIsDeployed(true)
    } finally {
      setIsDeploying(false)
      setActiveAgentId(null)
    }
  }

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim()
    if (!trimmed || isSending) return

    setChatMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setChatInput('')
    setIsSending(true)
    setActiveAgentId(AGENT_ID)

    try {
      const result = await callAIAgent(trimmed, AGENT_ID)
      if (result.success) {
        const responseText = result?.response?.result?.response_text ?? result?.response?.message ?? 'No response.'
        setChatMessages((prev) => [...prev, { role: 'bot', content: responseText }])
      } else {
        setChatMessages((prev) => [...prev, { role: 'bot', content: `Error: ${result?.error ?? 'Failed.'}` }])
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'bot', content: 'Error: Network issue.' }])
    } finally {
      setIsSending(false)
      setActiveAgentId(null)
    }
  }

  const scrollToDeploy = () => {
    deployRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const maskedApiKey = apiKey.length > 4 ? '****' + apiKey.slice(-4) : ''
  const botName = telegramToken.length > 4 ? `Bot_${telegramToken.slice(0, 4)}` : 'YourBot'

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans">

        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <RiTerminalBoxFill className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">SimpleClaw</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#deploy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deploy</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Architecture</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
              </div>
              <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                {mobileMenuOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
              <a href="#deploy" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Deploy</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Features</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Architecture</a>
              <a href="#" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Support</a>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Label htmlFor="sample-toggle-mobile" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch id="sample-toggle-mobile" checked={showSampleData} onCheckedChange={setShowSampleData} />
              </div>
            </div>
          )}
        </header>

        {/* ===== HERO TAGLINE ===== */}
        <section className="py-12 sm:py-16 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
              <RiRocketFill className="w-3 h-3 mr-1.5" />
              Deploy AI Bots in 60 Seconds
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
              Your AI. Your Key.{' '}
              <span className="text-primary">Your Bot.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Choose any model, plug in your API key, and deploy a Telegram bot instantly. No infrastructure needed.
            </p>
            <Button onClick={scrollToDeploy} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold px-8 py-6 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-primary/20">
              <RiRocketFill className="w-5 h-5 mr-2" />
              Start Deploying
            </Button>
          </div>
        </section>

        {/* ===== MAIN DEPLOY CARD (ALL-IN-ONE) ===== */}
        <section id="deploy" ref={deployRef} className="pb-16 sm:pb-20 px-4">
          <div className="max-w-2xl mx-auto">

            {!isDeployed ? (
              <Card className="bg-card border border-border rounded-xl shadow-2xl shadow-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Deploy OpenClaw</h2>
                    <p className="text-sm text-muted-foreground">Configure your bot and go live in under a minute.</p>
                  </div>

                  {/* --- Model Selection --- */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2.5 block text-foreground">Select Model</Label>
                    <div className="flex flex-wrap gap-2">
                      {MODELS.map((model) => {
                        const isSelected = selectedModel === model.id
                        return (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10' : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'}`}
                          >
                            {getModelIcon(model.iconType)}
                            <span>{model.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-border mb-6" />

                  {/* --- Channel Selection --- */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2.5 block text-foreground">Choose Channel</Label>
                    <div className="flex flex-wrap gap-2">
                      {CHANNELS.map((ch) => {
                        const isSelected = selectedChannel === ch.id
                        return (
                          <button
                            key={ch.id}
                            onClick={() => { if (ch.available) setSelectedChannel(ch.id) }}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${isSelected && ch.available ? 'border-primary bg-primary/10 text-foreground' : ch.available ? 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground' : 'border-border bg-secondary/30 text-muted-foreground/50 cursor-not-allowed'}`}
                          >
                            {getChannelIcon(ch.id)}
                            <span>{ch.name}</span>
                            {!ch.available && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border ml-1">Soon</Badge>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-border mb-6" />

                  {/* --- API Key Input --- */}
                  <div className="mb-5">
                    <Label htmlFor="apiKey" className="text-sm font-medium mb-1.5 block text-foreground">
                      API Key <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="pr-10 bg-input border-border font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showApiKey ? 'Hide key' : 'Show key'}
                      >
                        {showApiKey ? <RiEyeOffFill className="w-4 h-4" /> : <RiEyeFill className="w-4 h-4" />}
                      </button>
                    </div>
                    {apiKey.length > 0 && apiKey.length < 10 && (
                      <p className="text-xs text-destructive mt-1.5">API key seems too short.</p>
                    )}
                  </div>

                  {/* --- Bot Token Input --- */}
                  <div className="mb-6">
                    <Label htmlFor="telegramToken" className="text-sm font-medium mb-1.5 block text-foreground">
                      Telegram Bot Token <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="telegramToken"
                      type="text"
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="bg-input border-border font-mono text-sm"
                    />
                    {telegramToken.length > 0 && !isTokenValid && (
                      <p className="text-xs text-destructive mt-1.5">Token format: digits:alphanumeric (e.g., 123456789:ABCdef...)</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <RiTelegramFill className="w-3 h-3" />
                      <span>Get your token from</span>
                      <a href="https://core.telegram.org/bots#botfather" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                        @BotFather
                        <RiExternalLinkLine className="w-3 h-3 inline ml-0.5" />
                      </a>
                    </p>
                  </div>

                  {/* --- Deploy Button --- */}
                  <Button
                    onClick={handleDeploy}
                    disabled={!canDeploy}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-6 transition-all duration-300 disabled:opacity-40 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                  >
                    {isDeploying ? (
                      <>
                        <RiLoader4Fill className="w-5 h-5 mr-2 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <RiRocketFill className="w-5 h-5 mr-2" />
                        Deploy OpenClaw
                      </>
                    )}
                  </Button>

                  {!canDeploy && !isDeploying && (
                    <div className="mt-3 space-y-1">
                      {!isModelValid && <p className="text-xs text-muted-foreground flex items-center gap-1"><RiArrowRightSLine className="w-3 h-3" /> Select a model</p>}
                      {!isApiKeyValid && <p className="text-xs text-muted-foreground flex items-center gap-1"><RiArrowRightSLine className="w-3 h-3" /> Enter a valid API key (10+ chars)</p>}
                      {!isTokenValid && <p className="text-xs text-muted-foreground flex items-center gap-1"><RiArrowRightSLine className="w-3 h-3" /> Enter a valid Telegram bot token</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* ===== SUCCESS STATE ===== */
              <Card className="bg-card border border-border rounded-xl shadow-2xl shadow-accent/5">
                <CardContent className="p-6 sm:p-8">
                  {deployError ? (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 text-center mb-6">
                      <h3 className="text-lg font-semibold mb-1 text-destructive">Deployment Issue</h3>
                      <p className="text-sm text-muted-foreground mb-2">{deployError}</p>
                      <p className="text-xs text-muted-foreground">The chat below still works for testing.</p>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-accent/20">
                        <RiCheckboxCircleFill className="w-7 h-7 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1 tracking-tight">Your Bot is Live!</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Deployed with {MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel} on Telegram.
                      </p>
                      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><RiCpuLine className="w-3.5 h-3.5" /> {MODELS.find((m) => m.id === selectedModel)?.name ?? 'AI Model'}</span>
                        <span className="flex items-center gap-1"><RiKey2Fill className="w-3.5 h-3.5" /> {maskedApiKey}</span>
                      </div>
                      <a href={`https://t.me/${botName}`} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-[#26A5E4] text-white hover:bg-[#1d8bc0] font-semibold transition-all duration-300">
                          <RiTelegramFill className="w-5 h-5 mr-2" />
                          Open in Telegram
                          <RiExternalLinkLine className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  )}

                  <Separator className="bg-border mb-5" />

                  <h4 className="text-base font-semibold mb-3 tracking-tight flex items-center gap-2">
                    <RiChat3Fill className="w-4 h-4 text-primary" />
                    Live Chat Testing
                  </h4>

                  {/* Chat Area */}
                  <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
                    <div ref={chatContainerRef} className="h-72 overflow-y-auto p-4 space-y-3">
                      {chatMessages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          <p>Send a message to test your bot.</p>
                        </div>
                      )}
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-card border border-border text-card-foreground rounded-bl-md'}`}>
                            {msg.role === 'bot' ? renderMarkdown(msg.content) : msg.content}
                          </div>
                        </div>
                      ))}
                      {isSending && (
                        <div className="flex justify-start">
                          <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <RiLoader4Fill className="w-4 h-4 animate-spin" />
                              Thinking...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border p-3 flex items-center gap-2 bg-card/50">
                      <Input
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isSending && chatInput.trim()) { e.preventDefault(); handleSendMessage(); } }}
                        disabled={isSending}
                        className="flex-1 bg-input border-border text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSending || !chatInput.trim()}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-40 px-3"
                      >
                        {isSending ? <RiLoader4Fill className="w-4 h-4 animate-spin" /> : <RiSendPlaneFill className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Reset */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setIsDeployed(false)
                        setDeployError('')
                        setChatMessages([])
                        setChatInput('')
                        setSelectedModel('')
                        setApiKey('')
                        setTelegramToken('')
                        setShowSampleData(false)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Deploy another bot
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* ===== 10-STEP PIPELINE ===== */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">The 10-Step Launch Journey</h2>
              <p className="text-sm text-muted-foreground">From first visit to live chatting -- your bot launch pipeline.</p>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center justify-start min-w-[800px] px-2">
                {PIPELINE_STEPS.map((step, idx) => {
                  const stepNum = idx + 1
                  const isCompleted = stepNum < pipelineStep
                  const isCurrent = stepNum === pipelineStep
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCompleted ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                          {isCompleted ? <RiCheckFill className="w-4 h-4" /> : stepNum}
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isCompleted ? 'text-primary' : isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                      </div>
                      {idx < PIPELINE_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1.5 rounded-full transition-all duration-300 min-w-[30px] ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== COMPARISON TABLE ===== */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Why SimpleClaw?</h2>
              <p className="text-sm text-muted-foreground">See how we compare to other bot deployment platforms.</p>
            </div>
            <Card className="bg-card border border-border rounded-xl overflow-hidden">
              <CardContent className="p-0">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-secondary/50 px-5 py-3 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">Feature</span>
                  <span className="text-sm font-semibold text-primary text-center">SimpleClaw</span>
                  <span className="text-sm font-semibold text-muted-foreground text-center">Others</span>
                </div>
                {/* Table Rows */}
                {COMPARISON_ROWS.map((row, idx) => (
                  <div key={row.feature} className={`grid grid-cols-3 px-5 py-3 items-center ${idx < COMPARISON_ROWS.length - 1 ? 'border-b border-border' : ''} ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary/20'}`}>
                    <span className="text-sm text-foreground">{row.feature}</span>
                    <div className="flex justify-center">
                      {row.simpleclaw ? (
                        <RiCheckFill className="w-5 h-5 text-accent" />
                      ) : (
                        <RiCloseFill className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {row.others ? (
                        <RiCheckFill className="w-5 h-5 text-accent" />
                      ) : (
                        <RiCloseFill className="w-5 h-5 text-destructive/60" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ===== TECHNICAL ARCHITECTURE ===== */}
        <section id="architecture" className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Technical Architecture</h2>
              <p className="text-sm text-muted-foreground">Four layers working together for seamless bot deployment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ARCHITECTURE_CARDS.map((card) => (
                <Card key={card.title} className="bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                      {getArchitectureIcon(card.icon)}
                    </div>
                    <h3 className="text-base font-semibold mb-1.5 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES GRID ===== */}
        <section id="features" className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Everything You Need</h2>
              <p className="text-sm text-muted-foreground">Built for developers who want full control over their AI bots.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <Card key={f.title} className="bg-card border border-border rounded-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group">
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                      {getFeatureIcon(f.icon)}
                    </div>
                    <h3 className="text-base font-semibold mb-1 tracking-tight">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== AGENT STATUS ===== */}
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card border border-border rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activeAgentId ? 'bg-accent animate-pulse shadow-lg shadow-accent/40' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-semibold">Telegram Chat Agent</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: {AGENT_ID.slice(0, 8)}...{AGENT_ID.slice(-4)}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${activeAgentId ? 'bg-accent/15 text-accent border-accent/30' : 'bg-muted text-muted-foreground border-border'}`}>
                    {activeAgentId ? 'Active' : 'Idle'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Receives messages and generates AI responses. Maintains conversational context within sessions.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-border py-10 mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <RiTerminalBoxFill className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold tracking-tight">SimpleClaw</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              </div>
              <p className="text-xs text-muted-foreground">Built with Lyzr</p>
            </div>
          </div>
        </footer>

      </div>
    </ErrorBoundary>
  )
}
