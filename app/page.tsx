'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  RiRobot2Fill,
  RiSendPlaneFill,
  RiTelegramFill,
  RiShieldCheckFill,
  RiRocketFill,
  RiKey2Fill,
  RiBankCardFill,
  RiEyeFill,
  RiEyeOffFill,
  RiCheckFill,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLoader4Fill,
  RiExternalLinkLine,
  RiGlobalLine,
  RiCpuLine,
  RiSparklingFill,
  RiMenuLine,
  RiCloseLine,
  RiCheckboxCircleFill,
  RiInformationLine,
  RiChat3Fill,
} from 'react-icons/ri'

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
  description: string
}

const MODELS: ModelOption[] = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable reasoning model' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic', description: 'Advanced analysis & writing' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', description: 'Multimodal intelligence' },
  { id: 'mistral', name: 'Mistral', provider: 'Mistral AI', description: 'Fast European LLM' },
  { id: 'llama', name: 'Llama', provider: 'Meta', description: 'Open source powerhouse' },
  { id: 'cohere', name: 'Cohere', provider: 'Cohere', description: 'Enterprise NLP specialist' },
]

const SAMPLE_CHAT: ChatMessage[] = [
  { role: 'user', content: 'Hello! Can you tell me about machine learning?' },
  { role: 'bot', content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves. There are three main types: supervised learning, unsupervised learning, and reinforcement learning.' },
  { role: 'user', content: 'What is supervised learning?' },
  { role: 'bot', content: 'Supervised learning is a type of machine learning where the model is trained on labeled data. The algorithm learns from example input-output pairs to predict outputs for new, unseen inputs. Common applications include image classification, spam detection, and price prediction.' },
]

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Mistral AI']

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

// ---------- Sub-Components ----------

function StickyHeader({ onDeployClick, mobileMenuOpen, setMobileMenuOpen }: {
  onDeployClick: () => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[0.875rem] bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <RiRobot2Fill className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground font-sans">SimpleClaw</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Features</a>
          <a href="#deploy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Deploy</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button onClick={onDeployClick} className="hidden sm:inline-flex bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 font-semibold text-sm">
            Deploy Your Bot
          </Button>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
          <a href="#deploy" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Deploy</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</a>
          <Button onClick={() => { setMobileMenuOpen(false); onDeployClick(); }} className="w-full bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.3)] font-semibold text-sm">
            Deploy Your Bot
          </Button>
        </div>
      )}
    </header>
  )
}

function HeroSection({ onDeployClick }: { onDeployClick: () => void }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Badge className="mb-6 bg-secondary text-secondary-foreground border-border px-4 py-1.5 text-xs font-medium tracking-wide">
          <RiSparklingFill className="w-3 h-3 mr-1.5 text-accent" />
          AI-Powered Telegram Bot Platform
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 font-sans">
          Deploy AI Chatbots to{' '}
          <span className="text-primary">Telegram</span>{' '}
          in 60 Seconds
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Choose your model, add your API key, and go live instantly. No infrastructure needed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Button onClick={onDeployClick} size="lg" className="bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_30px_rgba(139,92,246,0.4)] text-base font-semibold px-8 py-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]">
            <RiRocketFill className="w-5 h-5 mr-2" />
            Deploy Your Bot
          </Button>
          <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary text-base px-8 py-6 transition-all duration-300">
            <RiInformationLine className="w-5 h-5 mr-2" />
            Learn More
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-widest">Supports</span>
          {PROVIDERS.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
              <RiCpuLine className="w-4 h-4 text-primary" />
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: RiGlobalLine, title: 'Any Model', desc: 'Use any LLM provider -- OpenAI, Anthropic, Google, Mistral, Meta, and more.' },
    { icon: RiKey2Fill, title: 'Your API Key', desc: 'Full control with your own keys. No middleman pricing or usage caps.' },
    { icon: RiRocketFill, title: 'Instant Deploy', desc: 'Go from zero to live bot in under 60 seconds. No DevOps required.' },
    { icon: RiTelegramFill, title: 'Telegram Native', desc: 'Seamless Telegram integration with rich message formatting support.' },
    { icon: RiShieldCheckFill, title: 'Secure Auth', desc: 'Enterprise-grade security. Your keys are encrypted and never stored.' },
    { icon: RiBankCardFill, title: 'Pay & Go', desc: 'Simple one-time payment per bot. No subscriptions, no hidden fees.' },
  ]

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 font-sans">Everything You Need</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete platform for deploying and managing AI-powered Telegram chatbots.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title} className="bg-card border border-border rounded-[0.875rem] shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((label, idx) => {
        const isCompleted = idx < currentStep
        const isCurrent = idx === currentStep
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${isCompleted ? 'bg-accent text-accent-foreground shadow-[0_0_12px_rgba(80,250,123,0.3)]' : isCurrent ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.35)]' : 'bg-muted text-muted-foreground'}`}>
                {isCompleted ? <RiCheckFill className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-primary' : isCompleted ? 'text-accent' : 'text-muted-foreground'}`}>{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${idx < currentStep ? 'bg-accent' : 'bg-muted'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function ModelSelectionStep({ selectedModel, onSelect }: { selectedModel: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 tracking-tight">Select Your AI Model</h3>
      <p className="text-muted-foreground text-sm mb-6">Choose the LLM provider that best fits your needs.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`text-left p-4 rounded-[0.875rem] border transition-all duration-300 ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.25)]' : 'border-border bg-secondary/50 hover:border-muted-foreground/30 hover:bg-secondary'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-base">{model.name}</h4>
                  <p className="text-xs text-muted-foreground">{model.provider}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                  {isSelected && <RiCheckFill className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{model.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ApiKeyStep({ apiKey, setApiKey, selectedModel }: { apiKey: string; setApiKey: (v: string) => void; selectedModel: string }) {
  const [showKey, setShowKey] = useState(false)
  const provider = MODELS.find((m) => m.id === selectedModel)?.provider ?? 'your provider'

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 tracking-tight">Enter Your API Key</h3>
      <p className="text-muted-foreground text-sm mb-6">Provide your {provider} API key. It is encrypted and never stored.</p>
      <div className="space-y-4 max-w-lg">
        <div>
          <Label htmlFor="apiKey" className="text-sm font-medium mb-1.5 block">API Key <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? 'text' : 'password'}
              placeholder={`Enter your ${provider} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10 bg-input border-border"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <RiEyeOffFill className="w-4 h-4" /> : <RiEyeFill className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <RiInformationLine className="w-3.5 h-3.5" />
          <a href="#" className="underline hover:text-foreground transition-colors">Where do I find my API key?</a>
        </p>
        {apiKey.length > 0 && apiKey.length < 10 && (
          <p className="text-xs text-destructive">API key seems too short. Please check and try again.</p>
        )}
      </div>
    </div>
  )
}

function TelegramTokenStep({ telegramToken, setTelegramToken }: { telegramToken: string; setTelegramToken: (v: string) => void }) {
  const isValidFormat = telegramToken.length === 0 || /^\d+:[A-Za-z0-9_-]+$/.test(telegramToken)

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 tracking-tight">Telegram Bot Token</h3>
      <p className="text-muted-foreground text-sm mb-6">Enter the token from BotFather to connect your Telegram bot.</p>
      <div className="space-y-4 max-w-lg">
        <div>
          <Label htmlFor="telegramToken" className="text-sm font-medium mb-1.5 block">Bot Token <span className="text-destructive">*</span></Label>
          <Input
            id="telegramToken"
            type="text"
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            value={telegramToken}
            onChange={(e) => setTelegramToken(e.target.value)}
            className="bg-input border-border font-mono text-sm"
          />
        </div>
        {!isValidFormat && telegramToken.length > 0 && (
          <p className="text-xs text-destructive">Token format should be digits:alphanumeric (e.g., 123456789:ABCdef...)</p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <RiTelegramFill className="w-3.5 h-3.5" />
          <a href="https://core.telegram.org/bots#botfather" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
            How to create a Telegram bot
            <RiExternalLinkLine className="w-3 h-3 inline ml-1" />
          </a>
        </p>
      </div>
    </div>
  )
}

function ReviewStep({ selectedModel, apiKey, telegramToken, isDeploying, onDeploy }: {
  selectedModel: string
  apiKey: string
  telegramToken: string
  isDeploying: boolean
  onDeploy: () => void
}) {
  const model = MODELS.find((m) => m.id === selectedModel)
  const maskedKey = apiKey.length > 4 ? '****' + apiKey.slice(-4) : '****'
  const maskedToken = telegramToken.length > 8 ? telegramToken.slice(0, 4) + '****' + telegramToken.slice(-4) : '****'

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 tracking-tight">Review Configuration</h3>
      <p className="text-muted-foreground text-sm mb-6">Verify everything looks correct before deploying.</p>

      <Card className="bg-secondary/50 border-border rounded-[0.875rem] max-w-lg mb-6">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Model</span>
            <span className="text-sm font-semibold">{model?.name ?? selectedModel} <span className="text-muted-foreground font-normal">({model?.provider})</span></span>
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Key</span>
            <span className="text-sm font-mono">{maskedKey}</span>
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bot Token</span>
            <span className="text-sm font-mono">{maskedToken}</span>
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Platform</span>
            <span className="text-sm font-semibold flex items-center gap-1.5"><RiTelegramFill className="w-4 h-4 text-primary" /> Telegram</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onDeploy}
        disabled={isDeploying}
        size="lg"
        className="bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_30px_rgba(139,92,246,0.4)] font-semibold px-8 transition-all duration-300 disabled:opacity-50"
      >
        {isDeploying ? (
          <>
            <RiLoader4Fill className="w-5 h-5 mr-2 animate-spin" />
            Deploying...
          </>
        ) : (
          <>
            <RiRocketFill className="w-5 h-5 mr-2" />
            Deploy with SimpleClaw
          </>
        )}
      </Button>
    </div>
  )
}

function SuccessStep({ selectedModel, telegramToken, chatMessages, chatInput, setChatInput, isSending, onSendMessage, chatContainerRef, deployError }: {
  selectedModel: string
  telegramToken: string
  chatMessages: ChatMessage[]
  chatInput: string
  setChatInput: (v: string) => void
  isSending: boolean
  onSendMessage: () => void
  chatContainerRef: React.RefObject<HTMLDivElement | null>
  deployError: string
}) {
  const model = MODELS.find((m) => m.id === selectedModel)
  const botName = telegramToken.length > 4 ? `Bot_${telegramToken.slice(0, 4)}` : 'YourBot'

  if (deployError) {
    return (
      <div>
        <div className="bg-destructive/10 border border-destructive/30 rounded-[0.875rem] p-6 text-center mb-6">
          <h3 className="text-xl font-semibold mb-2 text-destructive">Deployment Issue</h3>
          <p className="text-sm text-muted-foreground mb-4">{deployError}</p>
          <p className="text-xs text-muted-foreground">The chat below still works for testing your agent connection.</p>
        </div>
        <LiveChat
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isSending={isSending}
          onSendMessage={onSendMessage}
          chatContainerRef={chatContainerRef}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-accent/10 border border-accent/30 rounded-[0.875rem] p-6 text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(80,250,123,0.3)]">
          <RiCheckboxCircleFill className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight">Your Bot is Live!</h3>
        <p className="text-muted-foreground text-sm mb-4">Successfully deployed with {model?.name ?? selectedModel} on Telegram.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><RiCpuLine className="w-3.5 h-3.5" /> {model?.name}</span>
          <span className="flex items-center gap-1"><RiRobot2Fill className="w-3.5 h-3.5" /> {botName}</span>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <a href={`https://t.me/${botName}`} target="_blank" rel="noopener noreferrer">
          <Button className="bg-[#26A5E4] text-white hover:bg-[#1d8bc0] font-semibold transition-all duration-300">
            <RiTelegramFill className="w-5 h-5 mr-2" />
            Open in Telegram
            <RiExternalLinkLine className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>

      <Separator className="bg-border mb-6" />

      <h4 className="text-lg font-semibold mb-4 tracking-tight flex items-center gap-2">
        <RiChat3Fill className="w-5 h-5 text-primary" />
        Live Chat Testing
      </h4>

      <LiveChat
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        isSending={isSending}
        onSendMessage={onSendMessage}
        chatContainerRef={chatContainerRef}
      />
    </div>
  )
}

function LiveChat({ chatMessages, chatInput, setChatInput, isSending, onSendMessage, chatContainerRef }: {
  chatMessages: ChatMessage[]
  chatInput: string
  setChatInput: (v: string) => void
  isSending: boolean
  onSendMessage: () => void
  chatContainerRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <Card className="bg-secondary/30 border-border rounded-[0.875rem] overflow-hidden">
      <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>Send a message to start chatting with your bot.</p>
          </div>
        )}
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border text-card-foreground rounded-bl-md'}`}>
              {msg.role === 'bot' ? renderMarkdown(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm">
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
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isSending && chatInput.trim()) { e.preventDefault(); onSendMessage(); } }}
          disabled={isSending}
          className="flex-1 bg-input border-border text-sm"
        />
        <Button
          onClick={onSendMessage}
          disabled={isSending || !chatInput.trim()}
          size="sm"
          className="bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-50 px-3"
        >
          {isSending ? <RiLoader4Fill className="w-4 h-4 animate-spin" /> : <RiSendPlaneFill className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  )
}

function FooterSection() {
  return (
    <footer className="border-t border-border py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <RiRobot2Fill className="w-4 h-4 text-primary-foreground" />
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
  )
}

function AgentStatusCard({ activeAgentId }: { activeAgentId: string | null }) {
  return (
    <Card className="bg-card border border-border rounded-[0.875rem] shadow-xl max-w-2xl mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${activeAgentId ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(80,250,123,0.5)]' : 'bg-muted-foreground'}`} />
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
  )
}

// ---------- Main Page Component ----------

export default function Page() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedModel, setSelectedModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [telegramToken, setTelegramToken] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDeployed, setIsDeployed] = useState(false)
  const [deployError, setDeployError] = useState('')

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  // UI state
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Refs
  const deployRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Steps
  const STEPS = ['Model', 'API Key', 'Token', 'Review', 'Live']

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, isSending])

  // Sample data toggle
  useEffect(() => {
    if (showSampleData) {
      setSelectedModel('gpt-4')
      setApiKey('sk-proj-abcdefghijklmnopqrstuvwxyz1234567890')
      setTelegramToken('6123456789:AAHnDq2w5xK9qM3jL7vB8cR4fY1zP0sE2uW')
      setCurrentStep(4)
      setIsDeployed(true)
      setChatMessages(SAMPLE_CHAT)
      setDeployError('')
    } else {
      setSelectedModel('')
      setApiKey('')
      setTelegramToken('')
      setCurrentStep(0)
      setIsDeployed(false)
      setChatMessages([])
      setChatInput('')
      setDeployError('')
    }
  }, [showSampleData])

  const scrollToDeploy = useCallback(() => {
    deployRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return selectedModel !== ''
      case 1: return apiKey.length >= 10
      case 2: return /^\d+:[A-Za-z0-9_-]+$/.test(telegramToken)
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeployError('')
    setActiveAgentId(AGENT_ID)
    try {
      const model = MODELS.find((m) => m.id === selectedModel)
      const message = `Deploy a Telegram bot using ${model?.name ?? selectedModel} model from ${model?.provider ?? 'unknown provider'}. The bot should respond to messages intelligently. Test connectivity and confirm deployment is ready.`
      const result = await callAIAgent(message, AGENT_ID)
      if (result.success) {
        const responseText = result?.response?.result?.response_text ?? result?.response?.message ?? ''
        setIsDeployed(true)
        setCurrentStep(4)
        if (responseText) {
          setChatMessages([{ role: 'bot', content: responseText }])
        }
      } else {
        setDeployError(result?.error ?? 'Deployment failed. Please check your configuration and try again.')
        setCurrentStep(4)
        setIsDeployed(true)
      }
    } catch {
      setDeployError('An unexpected error occurred during deployment.')
      setCurrentStep(4)
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
        const responseText = result?.response?.result?.response_text ?? result?.response?.message ?? 'I received your message but have no response to show.'
        setChatMessages((prev) => [...prev, { role: 'bot', content: responseText }])
      } else {
        setChatMessages((prev) => [...prev, { role: 'bot', content: `Error: ${result?.error ?? 'Failed to get a response. Please try again.'}` }])
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'bot', content: 'Error: Network issue. Please check your connection and try again.' }])
    } finally {
      setIsSending(false)
      setActiveAgentId(null)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <ModelSelectionStep selectedModel={selectedModel} onSelect={setSelectedModel} />
      case 1:
        return <ApiKeyStep apiKey={apiKey} setApiKey={setApiKey} selectedModel={selectedModel} />
      case 2:
        return <TelegramTokenStep telegramToken={telegramToken} setTelegramToken={setTelegramToken} />
      case 3:
        return <ReviewStep selectedModel={selectedModel} apiKey={apiKey} telegramToken={telegramToken} isDeploying={isDeploying} onDeploy={handleDeploy} />
      case 4:
        return (
          <SuccessStep
            selectedModel={selectedModel}
            telegramToken={telegramToken}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isSending={isSending}
            onSendMessage={handleSendMessage}
            chatContainerRef={chatContainerRef}
            deployError={deployError}
          />
        )
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans" style={{ letterSpacing: '-0.01em', lineHeight: '1.5' }}>
        <StickyHeader
          onDeployClick={scrollToDeploy}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <HeroSection onDeployClick={scrollToDeploy} />

        <FeaturesSection />

        {/* Deployment Wizard Section */}
        <section id="deploy" ref={deployRef} className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 font-sans">Deploy Your Bot</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Follow these steps to get your AI chatbot live on Telegram.</p>
            </div>

            {/* Sample Data Toggle */}
            <div className="flex items-center justify-end gap-3 mb-6">
              <Label htmlFor="sample-toggle" className="text-sm text-muted-foreground cursor-pointer">Sample Data</Label>
              <Switch
                id="sample-toggle"
                checked={showSampleData}
                onCheckedChange={setShowSampleData}
              />
            </div>

            <Card className="bg-card border border-border rounded-[0.875rem] shadow-2xl shadow-primary/5">
              <CardContent className="p-6 sm:p-8">
                <StepIndicator currentStep={currentStep} steps={STEPS} />

                <div className="min-h-[320px]">
                  {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                {currentStep < 4 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className="border-border text-foreground hover:bg-secondary transition-all duration-300 disabled:opacity-30"
                    >
                      <RiArrowLeftLine className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    {currentStep < 3 && (
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        className="bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-30"
                      >
                        Next
                        <RiArrowRightLine className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing Anchor */}
        <section id="pricing" className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 font-sans">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">No subscriptions. Pay once per bot deployment. Scale on your terms.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="bg-card border border-border rounded-[0.875rem] shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-1">Starter</h3>
                  <p className="text-3xl font-bold text-primary mb-1">Free</p>
                  <p className="text-xs text-muted-foreground mb-4">Try it out</p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-center gap-2"><RiCheckFill className="w-4 h-4 text-accent flex-shrink-0" /> 1 bot deployment</li>
                    <li className="flex items-center gap-2"><RiCheckFill className="w-4 h-4 text-accent flex-shrink-0" /> Any model provider</li>
                    <li className="flex items-center gap-2"><RiCheckFill className="w-4 h-4 text-accent flex-shrink-0" /> Community support</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card border-2 border-primary rounded-[0.875rem] shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/15 transition-all duration-300 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3">Popular</Badge>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-1">Pro</h3>
                  <p className="text-3xl font-bold text-primary mb-1">$29</p>
                  <p className="text-xs text-muted-foreground mb-4">per bot, one-time</p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-center gap-2"><RiCheckFill className="w-4 h-4 text-accent flex-shrink-0" /> Unlimited messages</li>
                    <li className="flex items-center gap-2"><RiCheckFill className="w-4 h-4 text-accent flex-shrink-0" /> Priority support</li>
                    <li className="flex items-center gap-2"><RiCheckFill className="w-4 h-4 text-accent flex-shrink-0" /> Analytics dashboard</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Agent Status */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AgentStatusCard activeAgentId={activeAgentId} />
          </div>
        </section>

        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
