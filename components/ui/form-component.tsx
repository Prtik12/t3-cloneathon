/* eslint-disable @next/next/no-img-element */
// /components/ui/form-component.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Globe, Telescope, Eye as EyeIcon, X, BrainCircuit, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { UIMessage } from '@ai-sdk/ui-utils';
import useWindowSize from '@/hooks/use-window-size';
import { SearchGroup, SearchGroupId, searchGroups } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDropdownStore } from '@/lib/dropdown-store';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { User } from '@/lib/db/schema';
import { SVGProps } from 'react';
// Route icon component
const RouteIcon = ({ size = 14, className }: { size?: number; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="6" cy="19" r="3"/>
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
        <circle cx="18" cy="5" r="3"/>
    </svg>
);

// Fix ReferenceError: define actualGroupIds here
const actualGroupIds = ["academic", "youtube", "reddit", "x", "analysis", "memory"];

interface Attachment {
    url: string;
    name: string;
    contentType: string;
    size: number;
}

interface ModelSwitcherProps {
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    className?: string;
    showExperimentalModels: boolean;
    attachments: Array<Attachment>;
    messages: Array<Message>;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    onModelSelect?: (model: typeof models[0]) => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onGroupSelectorClose?: () => void;
    selectedFilters?: Set<string>;
}



const OpenAIIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="118 120 480 480" fill="currentColor" className={`size-7 text-[--model-primary] ${className}`}>
        <path d="M304.246 295.411V249.828C304.246 245.989 305.687 243.109 309.044 241.191L400.692 188.412C413.167 181.215 428.042 177.858 443.394 177.858C500.971 177.858 537.44 222.482 537.44 269.982C537.44 273.34 537.44 277.179 536.959 281.018L441.954 225.358C436.197 222 430.437 222 424.68 225.358L304.246 295.411ZM518.245 472.945V364.024C518.245 357.304 515.364 352.507 509.608 349.149L389.174 279.096L428.519 256.543C431.877 254.626 434.757 254.626 438.115 256.543L529.762 309.323C556.154 324.679 573.905 357.304 573.905 388.971C573.905 425.436 552.315 459.024 518.245 472.941V472.945ZM275.937 376.982L236.592 353.952C233.235 352.034 231.794 349.154 231.794 345.315V239.756C231.794 188.416 271.139 149.548 324.4 149.548C344.555 149.548 363.264 156.268 379.102 168.262L284.578 222.964C278.822 226.321 275.942 231.119 275.942 237.838V376.986L275.937 376.982ZM360.626 425.922L304.246 394.255V327.083L360.626 295.416L417.002 327.083V394.255L360.626 425.922ZM396.852 571.789C376.698 571.789 357.989 565.07 342.151 553.075L436.674 498.374C442.431 495.017 445.311 490.219 445.311 483.499V344.352L485.138 367.382C488.495 369.299 489.936 372.179 489.936 376.018V481.577C489.936 532.917 450.109 571.785 396.852 571.785V571.789ZM283.134 464.79L191.486 412.01C165.094 396.654 147.343 364.029 147.343 332.362C147.343 295.416 169.415 262.309 203.48 248.393V357.791C203.48 364.51 206.361 369.308 212.117 372.665L332.074 442.237L292.729 464.79C289.372 466.707 286.491 466.707 283.134 464.79ZM277.859 543.48C223.639 543.48 183.813 502.695 183.813 452.314C183.813 448.475 184.294 444.636 184.771 440.797L279.295 495.498C285.051 498.856 290.812 498.856 296.568 495.498L417.002 425.927V471.509C417.002 475.349 415.562 478.229 412.204 480.146L320.557 532.926C308.081 540.122 293.206 543.48 277.854 543.48H277.859ZM396.852 600.576C454.911 600.576 503.37 559.313 514.41 504.612C568.149 490.696 602.696 440.315 602.696 388.976C602.696 355.387 588.303 322.762 562.392 299.25C564.791 289.173 566.231 279.096 566.231 269.024C566.231 200.411 510.571 149.067 446.274 149.067C433.322 149.067 420.846 150.984 408.37 155.305C386.775 134.192 357.026 120.758 324.4 120.758C266.342 120.758 217.883 162.02 206.843 216.721C153.104 230.637 118.557 281.018 118.557 332.357C118.557 365.946 132.95 398.571 158.861 422.083C156.462 432.16 155.022 442.237 155.022 452.309C155.022 520.922 210.682 572.266 274.978 572.266C287.931 572.266 300.407 570.349 312.883 566.028C334.473 587.141 364.222 600.576 396.852 600.576Z" />
    </svg>
)

const GeminiIcon = ({ className }: { className?: string }) => (
    <svg className={`size-4 text-color-heading ${className}`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <title>Gemini</title>
        <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" />
    </svg>
);

const QwenIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        fill="#A855F7" 
        fillRule="evenodd" 
        height="1em" 
        style={{
    flex: "none",
    lineHeight: 1
        }} 
        viewBox="0 0 24 24" 
        width="1em" 
        xmlns="http://www.w3.org/2000/svg" 
        {...props}
    >
        <path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" />
    </svg>
);

const AnthropicIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg className="size-7 text-[--model-primary]" viewBox="0 0 46 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <title>Anthropic</title>
        <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
    </svg>
);

const GroqIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 201 201" 
        width="1em" 
        height="1em" 
        {...props}
    >
        <path fill="#F54F35" d="M0 0h201v201H0V0Z" />
        <path fill="#FEFBFB" d="m128 49 1.895 1.52C136.336 56.288 140.602 64.49 142 73c.097 1.823.148 3.648.161 5.474l.03 3.247.012 3.482.017 3.613c.01 2.522.016 5.044.02 7.565.01 3.84.041 7.68.072 11.521.007 2.455.012 4.91.016 7.364l.038 3.457c-.033 11.717-3.373 21.83-11.475 30.547-4.552 4.23-9.148 7.372-14.891 9.73l-2.387 1.055c-9.275 3.355-20.3 2.397-29.379-1.13-5.016-2.38-9.156-5.17-13.234-8.925 3.678-4.526 7.41-8.394 12-12l3.063 2.375c5.572 3.958 11.135 5.211 17.937 4.625 6.96-1.384 12.455-4.502 17-10 4.174-6.784 4.59-12.222 4.531-20.094l.012-3.473c.003-2.414-.005-4.827-.022-7.241-.02-3.68 0-7.36.026-11.04-.003-2.353-.008-4.705-.016-7.058l.025-3.312c-.098-7.996-1.732-13.21-6.681-19.47-6.786-5.458-13.105-8.211-21.914-7.792-7.327 1.188-13.278 4.7-17.777 10.601C75.472 72.012 73.86 78.07 75 85c2.191 7.547 5.019 13.948 12 18 5.848 3.061 10.892 3.523 17.438 3.688l2.794.103c2.256.082 4.512.147 6.768.209v16c-16.682.673-29.615.654-42.852-10.848-8.28-8.296-13.338-19.55-13.71-31.277.394-9.87 3.93-17.894 9.562-25.875l1.688-2.563C84.698 35.563 110.05 34.436 128 49Z" />
    </svg>
);

const DeepSeekIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg className="size-7 text-[--model-primary]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <title>DeepSeek</title>
        <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
    </svg>
);

// Capability Icons
const ZapIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-4 w-4" {...props}>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
);

const EyeCapabilityIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye h-4 w-4" {...props}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const GlobeCapabilityIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-4 w-4" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
    </svg>
);

const FileTextIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-4 w-4" {...props}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </svg>
);

const BrainCapabilityIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-4 w-4" {...props}>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
        <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
        <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
        <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
        <path d="M6 18a4 4 0 0 1-1.967-.516" />
        <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
);

const ImagePlusIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-plus h-4 w-4" {...props}>
        <path d="M16 5h6" />
        <path d="M19 2v6" />
        <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        <circle cx="9" cy="9" r="2" />
    </svg>
);

const TelescopeIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/>
        <path d="m13.56 11.747 4.332-.924"/>
        <path d="m16 21-3.105-6.21"/>
        <circle cx="16" cy="13" r="2.5"/>
    </svg>
);

const models = [
    // ===== FAVORITES (Most Popular) - In your preferred order =====
    // OpenAI Popular Models
    { value: "t3-4o", label: "GPT 4o", icon: OpenAIIcon, iconClass: "text-current", description: "OpenAI's flagship multimodal model", color: "blue", vision: true, reasoning: false, experimental: false, category: "Favorites", pdf: true, fast: false, web: true, imageGeneration: true, extreme: true },
    { value: "t3-dall-e-3", label: "DALL-E 3", icon: OpenAIIcon, iconClass: "text-current", description: "Advanced AI image generation", color: "blue", vision: false, reasoning: false, experimental: false, category: "Favorites", pdf: false, fast: false, web: false, imageGeneration: true, extreme: false },
    
    // Anthropic Latest Models (Claude 4) - NO WEB SEARCH = NO EXTREME MODE
    { value: "t3-claude-4-sonnet", label: "Claude 4 Sonnet", icon: AnthropicIcon, iconClass: "text-current", description: "Latest Claude 4 Sonnet model", color: "violet", vision: true, reasoning: true, experimental: false, category: "Favorites", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-claude-4-opus", label: "Claude 4 Opus", icon: AnthropicIcon, iconClass: "text-current", description: "Most powerful Claude 4 model", color: "violet", vision: true, reasoning: true, experimental: false, category: "Favorites", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-claude-3-opus", label: "Claude 3 Opus", icon: AnthropicIcon, iconClass: "text-current", description: "Legacy powerful Claude model", color: "violet", vision: true, reasoning: false, experimental: false, category: "Favorites", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    
    // Google Gemini Models - HAS WEB SEARCH = EXTREME MODE COMPATIBLE
    { value: "t3-gemini-2-5-flash", label: "Gemini 2.5 Flash", icon: GeminiIcon, iconClass: "text-current", description: "Latest Gemini model with optimized streaming", color: "gemini", vision: true, reasoning: false, experimental: false, category: "Favorites", pdf: true, fast: true, web: true, imageGeneration: false, extreme: true },
    { value: "t3-gemini-1-5-pro", label: "Gemini 1.5 Pro", icon: GeminiIcon, iconClass: "text-current", description: "Professional Gemini model", color: "gemini", vision: true, reasoning: false, experimental: false, category: "Favorites", pdf: true, fast: false, web: true, imageGeneration: false, extreme: true },

    // ===== OPENAI MODELS =====
    { value: "t3-4o-mini", label: "GPT 4o mini", icon: OpenAIIcon, iconClass: "text-current", description: "Fast and efficient OpenAI model", color: "blue", vision: true, reasoning: false, experimental: false, category: "OpenAI", pdf: true, fast: true, web: false, imageGeneration: false, extreme: false },
    { value: "t3-o1", label: "o1", icon: OpenAIIcon, iconClass: "text-current", description: "Advanced reasoning model", color: "blue", vision: false, reasoning: true, experimental: false, category: "OpenAI", pdf: false, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-o1-mini", label: "o1 mini", icon: OpenAIIcon, iconClass: "text-current", description: "Compact reasoning model", color: "blue", vision: false, reasoning: true, experimental: false, category: "OpenAI", pdf: false, fast: true, web: false, imageGeneration: false, extreme: false },
    { value: "t3-gpt-4-turbo", label: "GPT 4 Turbo", icon: OpenAIIcon, iconClass: "text-current", description: "High-performance GPT-4 variant", color: "blue", vision: true, reasoning: false, experimental: false, category: "OpenAI", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },


    // ===== ANTHROPIC MODELS ===== - NO WEB SEARCH SUPPORT
    { value: "t3-claude-4-sonnet", label: "Claude 4 Sonnet", icon: AnthropicIcon, iconClass: "text-current", description: "Latest Claude 4 Sonnet model", color: "violet", vision: true, reasoning: true, experimental: false, category: "Anthropic", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-claude-4-opus", label: "Claude 4 Opus", icon: AnthropicIcon, iconClass: "text-current", description: "Most powerful Claude 4 model", color: "violet", vision: true, reasoning: true, experimental: false, category: "Anthropic", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-claude-3-5-sonnet", label: "Claude 3.5 Sonnet", icon: AnthropicIcon, iconClass: "text-current", description: "Previous generation Sonnet", color: "violet", vision: true, reasoning: false, experimental: false, category: "Anthropic", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-claude-3-5-haiku", label: "Claude 3.5 Haiku", icon: AnthropicIcon, iconClass: "text-current", description: "Fast and lightweight Claude", color: "violet", vision: true, reasoning: false, experimental: false, category: "Anthropic", pdf: true, fast: true, web: false, imageGeneration: false, extreme: false },
    { value: "t3-claude-3-opus", label: "Claude 3 Opus", icon: AnthropicIcon, iconClass: "text-current", description: "Legacy powerful Claude model", color: "violet", vision: true, reasoning: false, experimental: false, category: "Anthropic", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },

    // ===== GOOGLE MODELS ===== - HAS WEB SEARCH SUPPORT
    { value: "t3-gemini-2-5-flash", label: "Gemini 2.5 Flash", icon: GeminiIcon, iconClass: "text-current", description: "Latest Gemini model with optimized streaming", color: "gemini", vision: true, reasoning: false, experimental: false, category: "Google", pdf: true, fast: true, web: true, imageGeneration: false, extreme: true },
    { value: "t3-gemini-1-5-flash", label: "Gemini 1.5 Flash", icon: GeminiIcon, iconClass: "text-current", description: "Fast Gemini model", color: "gemini", vision: true, reasoning: false, experimental: false, category: "Google", pdf: true, fast: true, web: true, imageGeneration: false, extreme: true },
    { value: "t3-gemini-1-5-pro", label: "Gemini 1.5 Pro", icon: GeminiIcon, iconClass: "text-current", description: "Professional Gemini model", color: "gemini", vision: true, reasoning: false, experimental: false, category: "Google", pdf: true, fast: false, web: true, imageGeneration: false, extreme: true },



    // ===== SPECIALIZED MODELS ===== - ONLY MULTIMODAL HAS WEB SEARCH
    { value: "t3-reasoning-best", label: "Best Reasoning", icon: BrainCapabilityIcon, iconClass: "text-current", description: "Best hybrid reasoning model", color: "purple", vision: true, reasoning: true, experimental: false, category: "Specialized", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-vision-best", label: "Best Vision", icon: EyeCapabilityIcon, iconClass: "text-current", description: "Best vision understanding", color: "indigo", vision: true, reasoning: false, experimental: false, category: "Specialized", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-code-best", label: "Best Coding", icon: OpenAIIcon, iconClass: "text-current", description: "Best for coding tasks", color: "green", vision: true, reasoning: true, experimental: false, category: "Specialized", pdf: true, fast: false, web: false, imageGeneration: false, extreme: false },
    { value: "t3-multimodal-best", label: "Best Multimodal", icon: AnthropicIcon, iconClass: "text-current", description: "Best multimodal capabilities", color: "violet", vision: true, reasoning: true, experimental: false, category: "Specialized", pdf: true, fast: false, web: true, imageGeneration: false, extreme: true },
    
    // ===== FAST MODELS ===== - ONLY FLASH HAS WEB SEARCH
    { value: "t3-fast", label: "Fast (GPT-4o mini)", icon: ZapIcon, iconClass: "text-current", description: "Quick responses", color: "yellow", vision: true, reasoning: false, experimental: false, category: "Fast", pdf: true, fast: true, web: false, imageGeneration: false, extreme: false },
    { value: "t3-fast-haiku", label: "Fast (Claude Haiku)", icon: ZapIcon, iconClass: "text-current", description: "Lightning fast Claude", color: "yellow", vision: true, reasoning: false, experimental: false, category: "Fast", pdf: true, fast: true, web: false, imageGeneration: false, extreme: false },
    { value: "t3-fast-flash", label: "Fast (Gemini Flash)", icon: ZapIcon, iconClass: "text-current", description: "Super fast Gemini", color: "yellow", vision: true, reasoning: false, experimental: false, category: "Fast", pdf: true, fast: true, web: true, imageGeneration: false, extreme: true },

    // ===== IMAGE GENERATION ===== - NO WEB SEARCH NEEDED
    { value: "t3-dall-e-3", label: "DALL-E 3", icon: ImagePlusIcon, iconClass: "text-current", description: "High quality image generation", color: "pink", vision: false, reasoning: false, experimental: false, category: "Image Generation", pdf: false, fast: false, web: false, imageGeneration: true, extreme: false },
    { value: "t3-dall-e-2", label: "DALL-E 2", icon: ImagePlusIcon, iconClass: "text-current", description: "Standard image generation", color: "pink", vision: false, reasoning: false, experimental: false, category: "Image Generation", pdf: false, fast: true, web: false, imageGeneration: true, extreme: false },
];

const getColorClasses = (color: string, isSelected: boolean = false) => {
    const baseClasses = "transition-colors duration-75";
    const selectedClasses = isSelected ? "bg-opacity-100! dark:bg-opacity-100!" : "";

    // For selected state, use consistent theme colors like Gemini and OpenAI
    if (isSelected) {
    switch (color) {
        case 'black':
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        case 'gray':
                return `${baseClasses} ${selectedClasses} bg-secondary! dark:bg-secondary/80! text-secondary-foreground! hover:bg-secondary/80! dark:hover:bg-secondary/70! border-secondary! dark:border-secondary/80!`;
        case 'indigo':
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        case 'violet':
                return `${baseClasses} ${selectedClasses} bg-secondary! dark:bg-secondary/80! text-secondary-foreground! hover:bg-secondary/80! dark:hover:bg-secondary/70! border-secondary! dark:border-secondary/80!`;
        case 'purple':
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        case 'alpha':
                return `${baseClasses} ${selectedClasses} bg-secondary! dark:bg-secondary/80! text-secondary-foreground! hover:bg-secondary/80! dark:hover:bg-secondary/70! border-secondary! dark:border-secondary/80!`;
        case 'blue':
                return `${baseClasses} ${selectedClasses} bg-secondary! dark:bg-secondary/80! text-secondary-foreground! hover:bg-secondary/80! dark:hover:bg-secondary/70! border-secondary! dark:border-secondary/80!`;
        case 'gemini':
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        case 'vercel-gray':
                return `${baseClasses} ${selectedClasses} bg-secondary! dark:bg-secondary/80! text-secondary-foreground! hover:bg-secondary/80! dark:hover:bg-secondary/70! border-secondary! dark:border-secondary/80!`;
        case 'green':
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        case 'yellow':
                return `${baseClasses} ${selectedClasses} bg-secondary! dark:bg-secondary/80! text-secondary-foreground! hover:bg-secondary/80! dark:hover:bg-secondary/70! border-secondary! dark:border-secondary/80!`;
        case 'pink':
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        default:
                return `${baseClasses} ${selectedClasses} bg-accent! dark:bg-accent/80! text-accent-foreground! hover:bg-accent/80! dark:hover:bg-accent/70! border-accent! dark:border-accent/80!`;
        }
    } else {
        // For non-selected state, use consistent theme colors like Gemini and OpenAI
        switch (color) {
            case 'black':
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
            case 'gray':
                return `${baseClasses} text-secondary-foreground! dark:text-secondary! hover:bg-secondary! hover:text-secondary-foreground! dark:hover:bg-secondary/80! dark:hover:text-white!`;
            case 'indigo':
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
            case 'violet':
                return `${baseClasses} text-secondary-foreground! dark:text-secondary! hover:bg-secondary! hover:text-secondary-foreground! dark:hover:bg-secondary/80! dark:hover:text-white!`;
            case 'purple':
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
            case 'alpha':
                return `${baseClasses} text-secondary-foreground! dark:text-secondary! hover:bg-secondary! hover:text-secondary-foreground! dark:hover:bg-secondary/80! dark:hover:text-white!`;
            case 'blue':
                return `${baseClasses} text-secondary-foreground! dark:text-secondary! hover:bg-secondary! hover:text-secondary-foreground! dark:hover:bg-secondary/80! dark:hover:text-white!`;
            case 'gemini':
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
            case 'vercel-gray':
                return `${baseClasses} text-secondary-foreground! dark:text-secondary! hover:bg-secondary! hover:text-secondary-foreground! dark:hover:bg-secondary/80! dark:hover:text-white!`;
            case 'green':
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
            case 'yellow':
                return `${baseClasses} text-secondary-foreground! dark:text-secondary! hover:bg-secondary! hover:text-secondary-foreground! dark:hover:bg-secondary/80! dark:hover:text-white!`;
            case 'pink':
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
            default:
                return `${baseClasses} text-accent-foreground! dark:text-accent! hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent/80! dark:hover:text-white!`;
        }
    }
}

const ModelSwitcher: React.FC<ModelSwitcherProps & {
    onFilterClick: () => void;
}> = memo(({ selectedModel, setSelectedModel, className, showExperimentalModels, attachments, messages, status, onModelSelect, isOpen: externalIsOpen, onOpenChange, onGroupSelectorClose, onFilterClick, selectedFilters = new Set() }) => {
    const selectedModelData = models.find(model => model.value === selectedModel);
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllModels, setShowAllModels] = useState(false);
    const [internalSelectedFilters, setInternalSelectedFilters] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false); // Default to false so filters only open when clicked

    const isProcessing = status === 'submitted' || status === 'streaming';
    
    // Use internal filters if no external filters provided
    const activeFilters = selectedFilters || internalSelectedFilters;
    const setSelectedFilters = setInternalSelectedFilters;
    
    // Use Zustand store for dropdown state management
    const { modelSelectorOpen, filterDropdownOpen, setModelSelectorOpen, setFilterDropdownOpen, toggleFilterDropdown, handleFilterInteraction } = useDropdownStore();
    
    // Use external state if provided, otherwise use Zustand state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : modelSelectorOpen;
    const setIsOpen = onOpenChange || setModelSelectorOpen;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check for attachments in current and previous messages
    const hasAttachments = attachments.length > 0 || messages.some(msg =>
        msg.experimental_attachments && msg.experimental_attachments.length > 0
    );

    // Filter models based on attachments first
    // Always show experimental models by removing the experimental filter
    const filteredModels = hasAttachments
        ? models.filter(model => model.vision)
        : models;

    // Apply search filter
    const searchFilteredModels = searchQuery.trim() === '' 
        ? filteredModels 
        : filteredModels.filter(model => 
            model.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Apply capability filtering based on selected filters
    const capabilityFilteredModels = activeFilters.size === 0 
        ? searchFilteredModels 
        : searchFilteredModels.filter(model => {
            // If any filter is selected, model must match at least one filter
            const matches = Array.from(activeFilters).some(filterKey => {
                switch (filterKey) {
                    case 'fast':
                        return model.fast === true;
                    case 'vision':
                        return model.vision === true;
                    case 'web':
                        return model.web === true;
                    case 'pdf':
                        return model.pdf === true;
                    case 'reasoning':
                        return model.reasoning === true;
                    case 'imageGeneration':
                        return model.imageGeneration === true;
                    case 'extreme':
                        return model.extreme === true && model.web === true;
                    default:
                        return false;
                }
            });
            

            
            return matches;
        });

    // Limit to first 8 models unless showing all
    const limitedModels = showAllModels ? capabilityFilteredModels : capabilityFilteredModels.slice(0, 8);
    


    // Group filtered models by category
    const groupedModels = limitedModels.reduce((acc, model) => {
        const category = model.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(model);
        return acc;
    }, {} as Record<string, typeof models>);

    // All models grouped by category (used when showAllModels is true)
    const allGroupedModels = capabilityFilteredModels.reduce((acc, model) => {
        const category = model.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(model);
        return acc;
    }, {} as Record<string, typeof models>);

    // Ensure Specialized category appears first in the "Show All" section
    const orderedGroupedModels = {} as Record<string, typeof models>;
    if (allGroupedModels['Specialized']) {
        orderedGroupedModels['Specialized'] = allGroupedModels['Specialized'];
    }
    Object.keys(allGroupedModels).forEach(category => {
        if (category !== 'Specialized') {
            orderedGroupedModels[category] = allGroupedModels[category];
        }
    });

    // Get hover color classes using consistent theme colors like Gemini and OpenAI
    const getHoverColorClasses = (modelColor: string) => {
        switch (modelColor) {
            case 'black': return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
            case 'gray': return 'hover:bg-secondary/20! dark:hover:bg-secondary/15!';
            case 'indigo': return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
            case 'violet': return 'hover:bg-secondary/20! dark:hover:bg-secondary/15!';
            case 'purple': return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
            case 'gemini': return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
            case 'blue': return 'hover:bg-secondary/20! dark:hover:bg-secondary/15!';
            case 'vercel-gray': return 'hover:bg-secondary/20! dark:hover:bg-secondary/15!';
            case 'green': return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
            case 'yellow': return 'hover:bg-secondary/20! dark:hover:bg-secondary/15!';
            case 'pink': return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
            default: return 'hover:bg-accent/20! dark:hover:bg-accent/15!';
        }
    };

    // Update getCapabilityColors to handle all capabilities
    const getCapabilityColors = (capability: string) => {
        if (capability === 'reasoning') {
            return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700";
        } else if (capability === 'vision') {
            return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700";
        } else if (capability === 'pdf') {
            return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50";
        } else if (capability === 'fast') {
            return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50";
        } else if (capability === 'web') {
            return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50";
        } else if (capability === 'imageGeneration') {
            return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50";
        }
        return "";
    };

    // Don't render complex content until mounted to prevent hydration issues
    if (!mounted) {
        return (
            <div className={cn(
                "flex items-center gap-2 p-2 sm:px-3 h-8",
                "rounded-full transition-all duration-75",
                "border border-neutral-200 dark:border-neutral-800",
                className
            )}>
                <div className="w-3.5 h-3.5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <span className="hidden sm:block text-xs text-neutral-500">Loading...</span>
            </div>
        );
    }

    return (
        <>
            <DropdownMenu
            onOpenChange={(open) => {
                // Don't close model selector if filter dropdown is open
                if (!open && filterDropdownOpen) {
                    return; // Prevent closing
                }
                
                // Don't close model selector if filters are active  
                if (!open && activeFilters.size > 0) {
                    return; // Keep open when filters are selected
                }
                
                setIsOpen(open);
                // Close group selector when model selector opens
                if (open && onGroupSelectorClose) {
                    onGroupSelectorClose();
                }
                // Clear search and reset show all when dropdown closes
                if (!open) {
                    setSearchQuery('');
                    setShowAllModels(false);
                    setShowFilters(false);
                    // Also close filter dropdown when model selector closes
                    setFilterDropdownOpen(false);
                }
            }}
            open={isOpen && !isProcessing}
        >
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                    "rounded-full transition-all duration-75",
                    "border border-neutral-200 dark:border-neutral-800",
                    "hover:shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700",
                    getColorClasses(selectedModelData?.color || "neutral", true),
                    isProcessing && "opacity-50 pointer-events-none",
                    "ring-0 outline-hidden",
                    "group",
                    className
                )}
                disabled={!!isProcessing}
                suppressHydrationWarning
            >
                <div className="relative flex items-center gap-2">
                    {selectedModelData && (
                        typeof selectedModelData.icon === 'string' ? (
                            <img
                                src={selectedModelData.icon}
                                alt={selectedModelData.label}
                                className={cn(
                                    "w-3.5 h-3.5 object-contain transition-all duration-300",
                                    "group-hover:scale-110 group-hover:rotate-6",
                                    selectedModelData.iconClass
                                )}
                                suppressHydrationWarning
                            />
                        ) : (
                            <selectedModelData.icon
                                className={cn(
                                    "w-3.5 h-3.5 transition-all duration-300",
                                    "group-hover:scale-110 group-hover:rotate-6",
                                    selectedModelData.iconClass
                                )}
                                suppressHydrationWarning
                            />
                        )
                    )}
                    {!selectedModelData && <div className="w-3.5 h-3.5" />}
                    <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium overflow-hidden">
                        <div className="whitespace-nowrap" suppressHydrationWarning>
                            {selectedModelData?.label || "Loading..."}
                        </div>
                        <motion.div
                            animate={{
                                rotate: isOpen ? 180 : 0
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30
                            }}
                            className="opacity-60"
                        >
                            <svg
                                width="8"
                                height="5"
                                viewBox="0 0 9 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(
                    "p-0 rounded-xl shadow-xl overflow-hidden bg-popover border-border text-popover-foreground",
                    showAllModels 
                        ? showFilters 
                            ? "w-[800px] max-h-[85vh]" 
                            : "w-[800px] max-h-[80vh]"
                        : showFilters
                            ? "w-[400px] max-h-[650px]"
                            : "w-[400px] max-h-[600px]"
                )}
                align="start"
                style={{
                    transform: 'translateY(-100%) translateY(-40px)',
                    marginTop: '0px'
                }}
            >
                {/* Search Bar */}
                <div className="sticky top-0 rounded-t-lg px-3.5 pt-2 pb-1 bg-popover">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search ml-px mr-3 !size-4 text-muted-foreground">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input 
                            role="searchbox" 
                            aria-label="Search models" 
                            placeholder="Search models..." 
                            className="w-full bg-transparent py-2 text-sm placeholder:select-none focus:outline-none text-popover-foreground placeholder:text-muted-foreground" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                        />
                        {/* Model count indicator */}
                        {(activeFilters.size > 0 || searchQuery.trim() !== '') && (
                            <div className="ml-2 px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">
                                {capabilityFilteredModels.length} model{capabilityFilteredModels.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    
                    {/* Filter Chips */}
                    {showFilters && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-wrap gap-2 mt-3 mb-2"
                        >
                            {[
                                { key: 'fast', label: 'Fast', icon: ZapIcon, color: '#f59e0b' },
                                { key: 'vision', label: 'Vision', icon: EyeCapabilityIcon, color: '#10b981' },
                                { key: 'web', label: 'Web', icon: GlobeCapabilityIcon, color: '#3b82f6' },
                                { key: 'pdf', label: 'PDFs', icon: FileTextIcon, color: '#8b5cf6' },
                                { key: 'reasoning', label: 'Reasoning', icon: BrainCapabilityIcon, color: '#a855f7' },
                                { key: 'imageGeneration', label: 'Images', icon: ImagePlusIcon, color: '#f97316' },
                                { key: 'extreme', label: 'Extreme', icon: TelescopeIcon, color: '#ec4899' }
                            ].map(({ key, label, icon: Icon, color }) => (
                                <motion.button
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newFilters = new Set(activeFilters);
                                        if (activeFilters.has(key)) {
                                            newFilters.delete(key);
                                        } else {
                                            newFilters.add(key);
                                        }
                                        setSelectedFilters(newFilters as Set<string>);
                                    }}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-75 hover:scale-105 border",
                                        activeFilters.has(key) 
                                            ? "text-primary-foreground shadow-lg" 
                                            : "text-muted-foreground hover:text-foreground bg-secondary/50 border-border hover:border-border/60"
                                    )}
                                    style={{
                                        backgroundColor: activeFilters.has(key) 
                                            ? color 
                                            : undefined,
                                        borderColor: activeFilters.has(key) 
                                            ? color 
                                            : undefined,
                                        boxShadow: activeFilters.has(key) 
                                            ? `0 4px 12px ${color}40` 
                                            : undefined
                                    }}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                    {activeFilters.has(key) && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center ml-1"
                                        >
                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                            {/* Clear all filters button */}
                            {activeFilters.size > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedFilters(new Set());
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 border text-muted-foreground hover:text-foreground bg-secondary/50 border-border hover:border-border/60"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                    Clear all
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                    
                    <div className="border-b border-border"></div>
                </div>
                
                                <div className={cn(
                    "p-2", 
                    showAllModels && "overflow-y-auto",
                    showAllModels 
                        ? showFilters 
                            ? "max-h-[55vh]" 
                            : "max-h-[65vh]"
                        : showFilters
                            ? "max-h-[450px] overflow-y-auto"
                            : "max-h-auto"
                )}>
                <AnimatePresence mode="wait">
                {Object.entries(groupedModels).length === 0 && searchQuery.trim() !== '' ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                            <p className="text-sm">No models found</p>
                            <p className="text-xs mt-1">Try adjusting your search</p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        key={showAllModels ? 'expanded' : 'limited'}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            duration: 0.2
                        }}
                        className="space-y-1"
                    >
                        {showAllModels ? (
                            // Expanded view with all models in grid layout
                            <div className="space-y-6">
                                {/* All Models Section */}
                                {Object.entries(orderedGroupedModels).map(([category, categoryModels], categoryIndex) => {
                                    return (
                                        <motion.div
                                            key={category}
                                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ 
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 35,
                                                delay: categoryIndex * 0.03
                                            }}
                                        >
                                            <div className="px-2 mb-3">
                                                <h3 className="text-sm font-medium text-foreground">{category}</h3>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                {categoryModels.map((model, modelIndex) => (
                                                    <motion.div
                                                        key={model.value}
                                                        initial={{ opacity: 0, x: -10, scale: 0.98 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        transition={{ 
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 35,
                                                            delay: modelIndex * 0.03
                                                        }}
                                                    >
                                    <DropdownMenuItem
                                                            onSelect={() => {
                                                                setSelectedModel(model.value.trim());
                                                                if (onModelSelect) {
                                                                    onModelSelect(model);
                                                                }
                                                                setIsOpen(false);
                                                            }}
                                                            className={cn(
                                                                "flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105",
                                                                selectedModel === model.value 
                                                                    ? "bg-accent text-accent-foreground border border-border" 
                                                                    : "hover:bg-accent/50 text-popover-foreground"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-center w-8 h-8 mb-2">
                                                                {typeof model.icon === 'string' ? (
                                                                    <img
                                                                        src={model.icon}
                                                                        alt={model.label}
                                                                        className="w-6 h-6 object-contain"
                                                                    />
                                                                ) : (
                                                                    <model.icon className="w-6 h-6 text-foreground" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-medium text-center leading-tight mb-1">
                                                                {model.label}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 justify-center">
                                                                {model.vision && (
                                                                    <div className="w-3 h-3 rounded bg-teal-500/20 flex items-center justify-center">
                                                                        <EyeCapabilityIcon className="w-2 h-2 text-teal-400" />
                                                                    </div>
                                                                )}
                                                                {model.web && (
                                                                    <div className="w-3 h-3 rounded bg-blue-500/20 flex items-center justify-center">
                                                                        <GlobeCapabilityIcon className="w-2 h-2 text-blue-400" />
                                                                    </div>
                                                                )}
                                                                {model.pdf && (
                                                                    <div className="w-3 h-3 rounded bg-purple-500/20 flex items-center justify-center">
                                                                        <FileTextIcon className="w-2 h-2 text-purple-400" />
                                                                    </div>
                                                                )}
                                                                {model.reasoning && (
                                                                    <div className="w-3 h-3 rounded bg-violet-500/20 flex items-center justify-center">
                                                                        <BrainCapabilityIcon className="w-2 h-2 text-violet-400" />
                                                                    </div>
                                                                )}
                                                                {model.fast && (
                                                                    <div className="w-3 h-3 rounded bg-yellow-500/20 flex items-center justify-center">
                                                                        <ZapIcon className="w-2 h-2 text-yellow-400" />
                                                                    </div>
                                                                )}
                                                                {model.imageGeneration && (
                                                                    <div className="w-3 h-3 rounded bg-orange-500/20 flex items-center justify-center">
                                                                        <ImagePlusIcon className="w-2 h-2 text-orange-400" />
                                                                    </div>
                                                                )}
                                                                {model.extreme && model.web && (
                                                                    <div className="w-3 h-3 rounded bg-pink-500/20 flex items-center justify-center">
                                                                        <TelescopeIcon className="w-2 h-2 text-pink-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Limited view with Favorites section and simple list
                            <div className="space-y-4">
                                {/* Favorites Section in Limited View */}
                                {groupedModels.Stable && groupedModels.Stable.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    >
                                        <div className="flex items-center gap-2 mb-2 px-2">
                                            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <h3 className="text-sm font-medium text-foreground">Favorites</h3>
                                        </div>
                                        <div className="space-y-1">
                                            {groupedModels.Stable.slice(0, 3).map((model, modelIndex) => (
                                                <motion.div
                                                    key={model.value}
                                                    initial={{ opacity: 0, x: -10, scale: 0.98 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    transition={{ 
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 35,
                                                        delay: modelIndex * 0.03
                                                    }}
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            setSelectedModel(model.value.trim());
                                                            if (onModelSelect) {
                                                                onModelSelect(model);
                                                            }
                                                            setIsOpen(false);
                                                        }}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                                                            selectedModel === model.value 
                                                                ? "bg-accent text-accent-foreground border border-border" 
                                                                : "hover:bg-accent/50 text-popover-foreground"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-6 h-6">
                                                                {typeof model.icon === 'string' ? (
                                                                    <img
                                                                        src={model.icon}
                                                                        alt={model.label}
                                                                        className="w-5 h-5 object-contain"
                                                                    />
                                                                ) : (
                                                                    <model.icon className="w-5 h-5 text-foreground" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground leading-none">
                                                                    {model.label}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            {model.vision && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
                                                                            <EyeCapabilityIcon className="w-3 h-3 text-teal-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Vision</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.web && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                                                                            <GlobeCapabilityIcon className="w-3 h-3 text-blue-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Web Search</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.pdf && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                                                                            <FileTextIcon className="w-3 h-3 text-purple-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">PDF Support</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.reasoning && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
                                                                            <BrainCapabilityIcon className="w-3 h-3 text-violet-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Reasoning</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.imageGeneration && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
                                                                            <ImagePlusIcon className="w-3 h-3 text-orange-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Image Generation</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.extreme && model.web && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-pink-500/20 flex items-center justify-center">
                                                                            <TelescopeIcon className="w-3 h-3 text-pink-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Extreme Mode</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Other Models */}
                                {Object.entries(groupedModels).map(([category, categoryModels], categoryIndex) => {
                                    if (category === 'Stable') {
                                        // Show remaining Stable models after the first 3
                                        const remainingStableModels = categoryModels.slice(3);
                                        if (remainingStableModels.length === 0) return null;
                                        
                                        return (
                                            <motion.div 
                                                key={`${category}-remaining`} 
                                                className="space-y-1"
                                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 35, delay: categoryIndex * 0.03 }}
                                            >
                                                {remainingStableModels.map((model, modelIndex) => (
                                                    <motion.div
                                                        key={model.value}
                                                        initial={{ opacity: 0, x: -10, scale: 0.98 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 35, delay: modelIndex * 0.03 }}
                                                    >
                                                        <DropdownMenuItem
                                                            onSelect={() => {
                                                                setSelectedModel(model.value.trim());
                                                                if (onModelSelect) {
                                                                    onModelSelect(model);
                                                                }
                                                                setIsOpen(false);
                                                            }}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                                                                selectedModel === model.value 
                                                                    ? "bg-accent text-accent-foreground border border-border" 
                                                                    : "hover:bg-accent/50 text-popover-foreground"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-6 h-6">
                                                                    {typeof model.icon === 'string' ? (
                                                                        <img
                                                                            src={model.icon}
                                                                            alt={model.label}
                                                                            className="w-5 h-5 object-contain"
                                                                        />
                                                                    ) : (
                                                                        <model.icon className="w-5 h-5 text-foreground" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-foreground leading-none">
                                                                        {model.label}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2">
                                                                {model.vision && (
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
                                                                                <EyeCapabilityIcon className="w-3 h-3 text-teal-400" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="bg-popover border-border">
                                                                            <span className="text-xs text-popover-foreground">Vision</span>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {model.web && (
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                                                                                <GlobeCapabilityIcon className="w-3 h-3 text-blue-400" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="bg-popover border-border">
                                                                            <span className="text-xs text-popover-foreground">Web Search</span>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {model.pdf && (
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                                                                                <FileTextIcon className="w-3 h-3 text-purple-400" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="bg-popover border-border">
                                                                            <span className="text-xs text-popover-foreground">PDF Support</span>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {model.reasoning && (
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
                                                                                <BrainCapabilityIcon className="w-3 h-3 text-violet-400" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="bg-popover border-border">
                                                                            <span className="text-xs text-popover-foreground">Reasoning</span>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {model.imageGeneration && (
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
                                                                                <ImagePlusIcon className="w-3 h-3 text-orange-400" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="bg-popover border-border">
                                                                            <span className="text-xs text-popover-foreground">Image Generation</span>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {model.extreme && model.web && (
                                                                    <div className="w-3 h-3 rounded bg-pink-500/20 flex items-center justify-center">
                                                                        <TelescopeIcon className="w-2 h-2 text-pink-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        );
                                    }
                                    
                                    return (
                                        <motion.div 
                                            key={category} 
                                            className="space-y-1"
                                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 35, delay: categoryIndex * 0.03 }}
                                        >
                                            {categoryModels.map((model, modelIndex) => (
                                                <motion.div
                                                    key={model.value}
                                                    initial={{ opacity: 0, x: -10, scale: 0.98 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 35, delay: modelIndex * 0.03 }}
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            setSelectedModel(model.value.trim());
                                                            if (onModelSelect) {
                                                                onModelSelect(model);
                                                            }
                                                            setIsOpen(false);
                                                        }}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                                                            selectedModel === model.value 
                                                                ? "bg-accent text-accent-foreground border border-border" 
                                                                : "hover:bg-accent/50 text-popover-foreground"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-6 h-6">
                                                                {typeof model.icon === 'string' ? (
                                                                    <img
                                                                        src={model.icon}
                                                                        alt={model.label}
                                                                        className="w-5 h-5 object-contain"
                                                                    />
                                                                ) : (
                                                                    <model.icon className="w-5 h-5 text-foreground" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground leading-none">
                                                                    {model.label}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            {model.vision && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
                                                                            <EyeCapabilityIcon className="w-3 h-3 text-teal-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Vision</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.web && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                                                                            <GlobeCapabilityIcon className="w-3 h-3 text-blue-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Web Search</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.pdf && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                                                                            <FileTextIcon className="w-3 h-3 text-purple-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">PDF Support</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.reasoning && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
                                                                            <BrainCapabilityIcon className="w-3 h-3 text-violet-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Reasoning</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.imageGeneration && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
                                                                            <ImagePlusIcon className="w-3 h-3 text-orange-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Image Generation</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {model.extreme && model.web && (
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-5 h-5 rounded bg-pink-500/20 flex items-center justify-center">
                                                                            <TelescopeIcon className="w-3 h-3 text-pink-400" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-popover border-border">
                                                                        <span className="text-xs text-popover-foreground">Extreme Mode</span>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
                </div>
                
                {/* Bottom Controls */}
                {!showAllModels && (
                    <motion.div 
                        className="relative flex items-center justify-between rounded-b-lg pb-1 pl-1 pr-2.5 pt-1.5 mx-4 bg-popover"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            duration: 0.15
                        }}
                    >
                        <div className="absolute inset-x-3 top-0 border-b border-border" />
                        {capabilityFilteredModels.length > 8 && (
                        <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowAllModels(true);
                            }}
                            className="justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent/20 hover:text-accent-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground/50 h-9 px-4 py-2 flex items-center gap-2 pl-2 text-sm text-muted-foreground"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up h-4 w-4">
                                <path d="m18 15-6-6-6 6"></path>
                            </svg>
                            Show all
                        </button>
                        )}
                        <motion.button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFilters(!showFilters);
                            }}
                            data-filter-button
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent/20 hover:text-accent-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground/50 h-8 rounded-md text-xs gap-2 px-2 text-muted-foreground relative",
                                (showFilters || activeFilters.size > 0) && "bg-accent/20 text-accent-foreground"
                            )}
                            type="button"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                                duration: 0.2,
                                delay: 0.1,
                                ease: "easeOut"
                            }}
                        >
                            <motion.svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="lucide lucide-filter h-4 w-4"
                                initial={{ scale: 0.8, rotate: 45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    duration: 0.3,
                                    delay: 0.15,
                                    ease: "easeOut"
                                }}
                            >
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </motion.svg>
                            {activeFilters.size > 0 && (
                                <motion.div 
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ 
                                        duration: 0.2,
                                        delay: 0.2,
                                        ease: "backOut"
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-white">{activeFilters.size}</span>
                                </motion.div>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* Show All Models Toggle */}
                {showAllModels && (
                    <motion.div 
                        className="relative flex items-center justify-between rounded-b-lg pb-1 pl-1 pr-2.5 pt-1.5 mx-4 bg-popover"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            duration: 0.15
                        }}
                    >
                        <div className="absolute inset-x-3 top-0 border-b border-border" />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowAllModels(false);
                            }}
                            className="justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent/20 hover:text-accent-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground/50 h-9 px-4 py-2 flex items-center gap-2 pl-2 text-sm text-muted-foreground"
                        >
                            <motion.svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="lucide lucide-chevron-left h-4 w-4"
                                initial={{ rotate: 90, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ 
                                    duration: 0.3,
                                    delay: 0.15,
                                    ease: "easeOut"
                                }}
                            >
                                <path d="m15 18-6-6 6-6"></path>
                            </motion.svg>
                            Favourites
                        </button>
                        <motion.button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFilters(!showFilters);
                            }}
                            data-filter-button
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent/20 hover:text-accent-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground/50 h-8 rounded-md text-xs gap-2 px-2 text-muted-foreground relative",
                                (showFilters || activeFilters.size > 0) && "bg-accent/20 text-accent-foreground"
                            )}
                            type="button"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                                duration: 0.2,
                                delay: 0.1,
                                ease: "easeOut"
                            }}
                        >
                            <motion.svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="lucide lucide-filter h-4 w-4"
                                initial={{ scale: 0.8, rotate: 45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    duration: 0.3,
                                    delay: 0.15,
                                    ease: "easeOut"
                                }}
                            >
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </motion.svg>
                            {activeFilters.size > 0 && (
                                <motion.div 
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ 
                                        duration: 0.2,
                                        delay: 0.2,
                                        ease: "backOut"
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-white">{activeFilters.size}</span>
                                </motion.div>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>


    </>
    );
});

// Separate Model Filter Component
interface UploadingAttachment {
    file: File;
    progress: number;
    name: string;
}

interface FormComponentProps {
    input: string;
    setInput: (input: string) => void;
    attachments: Array<Attachment>;
    setAttachments: React.Dispatch<React.SetStateAction<Array<Attachment>>>;
    chatId: string;
    user: User | null;
    handleSubmit: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ChatRequestOptions,
    ) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    stop: () => void;
    messages: Array<UIMessage>;
    append: (
        message: Message | CreateMessage,
        chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    resetSuggestedQuestions: () => void;
    lastSubmittedQueryRef: React.MutableRefObject<string>;
    selectedGroup: SearchGroupId;
    setSelectedGroup: React.Dispatch<React.SetStateAction<SearchGroupId>>;
    showExperimentalModels: boolean;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GroupSelectorProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ToolbarButtonProps {
    group: SearchGroup;
    isSelected: boolean;
    onClick: () => void;
}

interface SwitchNotificationProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isVisible: boolean;
    modelColor?: string;
    notificationType?: 'model' | 'group';
}

// Memoized static icon components to prevent hydration mismatches
const ArrowUpIcon = memo(({ size = 16, className }: { size?: number; className?: string }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
            className={className}
            suppressHydrationWarning
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
                fill="currentColor"
            ></path>
        </svg>
    );
});

const StopIcon = memo(({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
            suppressHydrationWarning
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 3H13V13H3V3Z"
                fill="currentColor"
            ></path>
        </svg>
    );
});

const PaperclipIcon = memo(({ size = 16, className }: { size?: number; className?: string }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
            className={className}
            suppressHydrationWarning
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.8591 1.70735C10.3257 1.70735 9.81417 1.91925 9.437 2.29643L3.19455 8.53886C2.56246 9.17095 2.20735 10.0282 2.20735 10.9222C2.20735 11.8161 2.56246 12.6734 3.19455 13.3055C3.82665 13.9376 4.68395 14.2927 5.57786 14.2927C6.47178 14.2927 7.32908 13.9376 7.96117 13.3055L14.2036 7.06304L14.7038 6.56287L15.7041 7.56321L15.204 8.06337L8.96151 14.3058C8.06411 15.2032 6.84698 15.7074 5.57786 15.7074C4.30875 15.7074 3.09162 15.2032 2.19422 14.3058C1.29682 13.4084 0.792664 12.1913 0.792664 10.9222C0.792664 9.65305 1.29682 8.43592 2.19422 7.53852L8.43666 1.29609C9.07914 0.653606 9.95054 0.292664 10.8591 0.292664C11.7678 0.292664 12.6392 0.653606 13.2816 1.29609C13.9241 1.93857 14.2851 2.80997 14.2851 3.71857C14.2851 4.62718 13.9241 5.49858 13.2816 6.14106L13.2814 6.14133L7.0324 12.3835C7.03231 12.3836 7.03222 12.3837 7.03213 12.3838C6.64459 12.7712 6.11905 12.9888 5.57107 12.9888C5.02297 12.9888 4.49731 12.7711 4.10974 12.3835C3.72217 11.9959 3.50444 11.4703 3.50444 10.9222C3.50444 10.3741 3.72217 9.8484 4.10974 9.46084L4.11004 9.46054L9.877 3.70039L10.3775 3.20051L11.3772 4.20144L10.8767 4.70131L5.11008 10.4612C5.11005 10.4612 5.11003 10.4612 5.11 10.4613C4.98779 10.5835 4.91913 10.7493 4.91913 10.9222C4.91913 11.0951 4.98782 11.2609 5.11008 11.3832C5.23234 11.5054 5.39817 11.5741 5.57107 11.5741C5.74398 11.5741 5.9098 11.5054 6.03206 11.3832L6.03233 11.3829L12.2813 5.14072C12.2814 5.14063 12.2815 5.14054 12.2816 5.14045C12.6586 4.7633 12.8704 4.25185 12.8704 3.71857C12.8704 3.18516 12.6585 2.6736 12.2813 2.29643C11.9041 1.91925 11.3926 1.70735 10.8591 1.70735Z"
                fill="currentColor"
            ></path>
        </svg>
    );
});

// Constants and utility functions
const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_INPUT_CHARS = 10000;

// Helper function to convert File to base64 data URL for moderation
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Helper functions
const supportsPdfAttachments = (modelValue: string): boolean => {
    const selectedModel = models.find(model => model.value === modelValue);
    return selectedModel?.pdf === true;
};

const hasVisionSupport = (modelValue: string): boolean => {
    const selectedModel = models.find(model => model.value === modelValue);
    return selectedModel?.vision === true;
};

const getAcceptFileTypes = (modelValue: string): string => {
    const selectedModel = models.find(model => model.value === modelValue);
    if (selectedModel?.pdf) {
        return "image/*,.pdf";
    }
    return "image/*";
};

const truncateFilename = (filename: string, maxLength: number = 20) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const name = filename.substring(0, maxLength - 4);
    return `${name}...${extension}`;
};

// Memoized AttachmentPreview component
const AttachmentPreview: React.FC<{ attachment: Attachment | UploadingAttachment, onRemove: () => void, isUploading: boolean }> = memo(({ attachment, onRemove, isUploading }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB' +
            (bytes > MAX_FILE_SIZE ? ' (exceeds 5MB limit)' : '');
    };

    const isUploadingAttachment = (attachment: Attachment | UploadingAttachment): attachment is UploadingAttachment => {
        return 'progress' in attachment;
    };

    const isPdf = (attachment: Attachment | UploadingAttachment): boolean => {
        if (isUploadingAttachment(attachment)) {
            return attachment.file.type === 'application/pdf';
        }
        return (attachment as Attachment).contentType === 'application/pdf';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "relative flex items-center",
                "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs",
                "border border-neutral-200/80 dark:border-neutral-700/80",
                "rounded-2xl p-2 pr-8 gap-2.5",
                "shadow-xs hover:shadow-md",
                "shrink-0 z-0",
                "hover:bg-white dark:hover:bg-neutral-800",
                "transition-all duration-200",
                "group"
            )}
            suppressHydrationWarning
        >
            {isUploading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-neutral-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : isUploadingAttachment(attachment) ? (
                <div className="w-8 h-8 flex items-center justify-center">
                    <div className="relative w-6 h-6">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-neutral-200 dark:text-neutral-700 stroke-current"
                                strokeWidth="8"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                            ></circle>
                            <circle
                                className="text-primary stroke-current"
                                strokeWidth="8"
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeDasharray={`${attachment.progress * 251.2}, 251.2`}
                                transform="rotate(-90 50 50)"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200">{Math.round(attachment.progress * 100)}%</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 ring-1 ring-neutral-200/50 dark:ring-neutral-700/50 flex items-center justify-center">
                    {isPdf(attachment) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <path d="M9 15v-2h6v2"></path>
                            <path d="M12 18v-5"></path>
                        </svg>
                    ) : (
                        <img
                            src={(attachment as Attachment).url}
                            alt={`Preview of ${attachment.name}`}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
            )}
            <div className="grow min-w-0">
                {!isUploadingAttachment(attachment) && (
                    <p className="text-xs font-medium truncate text-neutral-800 dark:text-neutral-200">
                        {truncateFilename(attachment.name)}
                    </p>
                )}
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {isUploadingAttachment(attachment)
                        ? 'Uploading...'
                        : formatFileSize((attachment as Attachment).size)}
                </p>
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className={cn(
                    "absolute -top-1.5 -right-1.5 p-0.5 m-0 rounded-full",
                    "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs",
                    "border border-neutral-200/80 dark:border-neutral-700/80",
                    "shadow-xs hover:shadow-md",
                    "transition-all duration-200 z-20",
                    "opacity-0 group-hover:opacity-100",
                    "scale-75 group-hover:scale-100",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
            >
                <X className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
            </motion.button>
        </motion.div>
    );
});

// Memoized components to prevent unnecessary re-renders
const SwitchNotification: React.FC<SwitchNotificationProps> = memo(({
    icon,
    title,
    description,
    isVisible,
    modelColor = 'default',
    notificationType = 'model'
}) => {
    // Icon color is always white for better contrast on colored backgrounds
    const getIconColorClass = () => "text-white";

    // Get background color for model notifications using consistent theme colors like Gemini and OpenAI
    const getModelBgClass = (color: string) => {
        switch (color) {
            case 'black':
                return 'bg-accent dark:bg-accent/80 border-accent dark:border-accent/80';
            case 'gray':
                return 'bg-secondary dark:bg-secondary/80 border-secondary dark:border-secondary/80';
            case 'indigo':
                return 'bg-accent dark:bg-accent/80 border-accent dark:border-accent/80';
            case 'violet':
                return 'bg-secondary dark:bg-secondary/80 border-secondary dark:border-secondary/80';
            case 'purple':
                return 'bg-accent dark:bg-accent/80 border-accent dark:border-accent/80';
            case 'gemini':
                return 'bg-accent dark:bg-accent/80 border-accent dark:border-accent/80';
            case 'blue':
                return 'bg-secondary dark:bg-secondary/80 border-secondary dark:border-secondary/80';
            case 'vercel-gray':
                return 'bg-secondary dark:bg-secondary/80 border-secondary dark:border-secondary/80';
            default:
                return 'bg-accent dark:bg-accent/80 border-accent dark:border-accent/80';
        }
    };

    // For model notifications, use model colors. For group notifications, use theme background.
    const useModelColor = notificationType === 'model' && modelColor !== 'default';
    const bgColorClass = useModelColor
        ? getModelBgClass(modelColor)
        : "bg-card dark:bg-card border-border dark:border-border";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                        opacity: { duration: 0.2 },
                        height: { duration: 0.2 }
                    }}
                    className={cn(
                        "w-[97%] max-w-2xl overflow-hidden mx-auto z-0",
                        "text-sm text-neutral-700 dark:text-neutral-300 -mb-[0.499px]"
                    )}
                >
                    <div className={cn(
                        "flex items-center gap-2 p-2 py-1 sm:p-2.5 sm:py-2 rounded-t-lg border border-b-0 shadow-xs backdrop-blur-xs",
                        bgColorClass,
                        useModelColor ? "text-white" : "text-neutral-900 dark:text-neutral-100"
                    )}>
                        {icon && (
                            <div className={cn(
                                "shrink-0 flex items-center justify-center",
                                "w-3.5 h-3.5 sm:w-4 sm:h-4",
                                useModelColor ? getIconColorClass() : "text-primary",
                            )}>
                                <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-3 [&>svg]:max-h-3 sm:[&>svg]:max-w-3.5 sm:[&>svg]:max-h-3.5 [&>img]:w-full [&>img]:h-full [&>img]:object-contain">
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:flex-wrap gap-x-1.5 gap-y-0.5">
                            <span className={cn(
                                "font-semibold text-xs sm:text-sm",
                                useModelColor ? "text-white" : "text-neutral-900 dark:text-neutral-100"
                            )}>
                                {title}
                            </span>
                            <span className={cn(
                                "text-[10px] sm:text-xs leading-tight",
                                useModelColor ? "text-white/80" : "text-neutral-600 dark:text-neutral-400"
                            )}>
                                {description}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

const FormComponent: React.FC<FormComponentProps> = ({
    chatId,
    user,
    input,
    setInput,
    attachments,
    setAttachments,
    handleSubmit,
    fileInputRef,
    inputRef,
    stop,
    selectedModel,
    setSelectedModel,
    resetSuggestedQuestions,
    lastSubmittedQueryRef,
    selectedGroup,
    setSelectedGroup,
    showExperimentalModels,
    messages,
    status,
    setHasSubmitted,
}) => {
    const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
    const isMounted = useRef(true);
    const isCompositionActive = useRef(false)
    const { width } = useWindowSize();
    const postSubmitFileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isGroupSelectorExpanded, setIsGroupSelectorExpanded] = useState(false);
    const [showGroupSelector, setShowGroupSelector] = useState(false);
    
    // Separate state for toolbar toggles (not part of group selector)
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const [extremeModeEnabled, setExtremeModeEnabled] = useState(false);
    
    // Effect to sync toolbar states with selectedGroup changes
    useEffect(() => {
        // Sync toolbar states when selectedGroup changes from external sources (history, etc.)
        if (selectedGroup === 'web') {
            setWebSearchEnabled(true);
            setExtremeModeEnabled(false);
        } else if (selectedGroup === 'extreme') {
            setWebSearchEnabled(false);
            setExtremeModeEnabled(true);
        } else {
            // If a real group is selected or null, disable both toolbar modes
            setWebSearchEnabled(false);
            setExtremeModeEnabled(false);
        }
    }, [selectedGroup]);
    
    // Effect to update selectedGroup when web search or extreme mode is toggled
    // Only if no actual group is selected from the group selector
    useEffect(() => {
        // Only override selectedGroup if it's not one of the actual group selector options
        const actualGroupIds = ['academic', 'youtube', 'reddit', 'x', 'analysis', 'memory'];
        const isActualGroup = selectedGroup && actualGroupIds.includes(selectedGroup);
        
        if (!isActualGroup) {
            if (extremeModeEnabled) {
                setSelectedGroup('extreme');
            } else if (webSearchEnabled) {
                setSelectedGroup('web');
            } else {
                setSelectedGroup(null);
            }
        }
    }, [webSearchEnabled, extremeModeEnabled, selectedGroup, setSelectedGroup]);
    
    // Use Zustand store for dropdown state management
    const { modelSelectorOpen, filterDropdownOpen, setModelSelectorOpen, setFilterDropdownOpen, toggleFilterDropdown, handleFilterInteraction } = useDropdownStore();
    
    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownOpen) {
                const target = event.target as Element;
                if (!target.closest('[data-filter-dropdown]') && !target.closest('[data-filter-button]')) {
                    setFilterDropdownOpen(false);
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterDropdownOpen]);
    const groupSelectorRef = useRef<HTMLDivElement>(null);
    const [switchNotification, setSwitchNotification] = useState<{
        show: boolean;
        icon: React.ReactNode;
        title: string;
        description: string;
        notificationType?: 'model' | 'group';
        visibilityTimeout?: NodeJS.Timeout;
    }>({
        show: false,
        icon: null,
        title: '',
        description: '',
        notificationType: 'model',
        visibilityTimeout: undefined
    });

    const showSwitchNotification = (title: string, description: string, icon?: React.ReactNode, color?: string, type: 'model' | 'group' = 'model') => {
        // Clear any existing timeout to prevent conflicts
        if (switchNotification.visibilityTimeout) {
            clearTimeout(switchNotification.visibilityTimeout);
        }

        setSwitchNotification({
            show: true,
            icon: icon || null,
            title,
            description,
            notificationType: type,
            visibilityTimeout: undefined
        });

        // Auto hide after 3 seconds
        const timeout = setTimeout(() => {
            setSwitchNotification(prev => ({ ...prev, show: false }));
        }, 3000);

        // Update the timeout reference
        setSwitchNotification(prev => ({ ...prev, visibilityTimeout: timeout }));
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (switchNotification.visibilityTimeout) {
                clearTimeout(switchNotification.visibilityTimeout);
            }
        };
    }, [switchNotification.visibilityTimeout]);

    // Click outside to close group selector
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (groupSelectorRef.current && !groupSelectorRef.current.contains(event.target as Node)) {
                setShowGroupSelector(false);
            }
        };

        if (showGroupSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showGroupSelector]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const newValue = event.target.value;

        // Check if input exceeds character limit
        if (newValue.length > MAX_INPUT_CHARS) {
            setInput(newValue);
            toast.error(`Your input exceeds the maximum of ${MAX_INPUT_CHARS} characters.`);
        } else {
            setInput(newValue);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleGroupSelect = useCallback((group: SearchGroup) => {
        // Toggle functionality: if the same group is clicked, deselect it (set to null)
        if (selectedGroup === group.id) {
            setSelectedGroup(null);
            inputRef.current?.focus();
            
            showSwitchNotification(
                'Chat Mode',
                'No group selected - default chat mode',
                <MessageCircle className="size-4" />,
                'default',
                'group'
            );
        } else {
        setSelectedGroup(group.id);
            inputRef.current?.focus();

        showSwitchNotification(
            group.name,
            group.description,
            <group.icon className="size-4" />,
            group.id || undefined, // Use the group ID directly as the color code
            'group'   // Specify this is a group notification
        );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup, setSelectedGroup, inputRef]);

    const isProcessing = status === 'submitted' || status === 'streaming';
    const hasInteracted = messages.length > 0;
    const isMobile = width ? width < 768 : false;
    
    // Ensure consistent state calculation to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset submitting state when status changes to ready
    useEffect(() => {
        if (status === 'ready') {
            setIsSubmitting(false);
        }
    }, [status]);

    const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (status !== 'ready' || isSubmitting) {
            toast.error("Please wait for the current response to complete!");
            return;
        }

        setIsSubmitting(true);

        // Check if input exceeds character limit
        if (input.length > MAX_INPUT_CHARS) {
            toast.error(`Your input exceeds the maximum of ${MAX_INPUT_CHARS} characters. Please shorten your message.`);
            return;
        }

        if (input.trim() || attachments.length > 0) {
            setHasSubmitted(true);
            lastSubmittedQueryRef.current = input.trim();

            handleSubmit(event, {
                experimental_attachments: attachments,
            });

            setAttachments([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Reset submitting state after a delay
            setTimeout(() => setIsSubmitting(false), 2000);
        } else {
            toast.error("Please enter a search query or attach an image.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, attachments, handleSubmit, setAttachments, fileInputRef, lastSubmittedQueryRef, status, selectedModel, setHasSubmitted, isSubmitting]);

    const submitForm = useCallback(() => {
        onSubmit({ preventDefault: () => { }, stopPropagation: () => { } } as React.FormEvent<HTMLFormElement>);
        resetSuggestedQuestions();

        if (width && width > 768) {
            inputRef.current?.focus();
        }
    }, [onSubmit, resetSuggestedQuestions, width, inputRef]);

    const triggerFileInput = useCallback(() => {
        if (attachments.length >= MAX_FILES) {
            toast.error(`You can only attach up to ${MAX_FILES} images.`);
            return;
        }

        if (status === 'ready') {
            postSubmitFileInputRef.current?.click();
        } else {
            fileInputRef.current?.click();
        }
    }, [attachments.length, status]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !isCompositionActive.current) {
            event.preventDefault();
            if (status === 'submitted' || status === 'streaming') {
                toast.error("Please wait for the response to complete!");
            } else {
                submitForm();
                if (width && width > 768) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 100);
                }
            }
        }
    };

    // Get models that support web search
    const webSupportedModels = models.filter(model => model.web === true);
    const currentModelSupportsWeb = models.find(model => model.value === selectedModel)?.web === true;
    
    // Get models that support extreme mode (requires both extreme and web search)
    const extremeSupportedModels = models.filter(model => model.extreme === true && model.web === true);
    const currentModelSupportsExtreme = models.find(model => model.value === selectedModel)?.extreme === true && models.find(model => model.value === selectedModel)?.web === true;

    const handleWebSearchToggle = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if current model supports web search
        if (!currentModelSupportsWeb) {
            // Show toast suggesting web-compatible models
            const webModelSuggestions = webSupportedModels.slice(0, 3).map(m => m.label).join(', ');
            showSwitchNotification(
                'Web Search Unavailable',
                `Switch to a web-compatible model like ${webModelSuggestions}`,
                <Globe className="size-4" />,
                'web',
                'group'
            );
            return;
        }

        // Toggle web search mode (separate from group selector)
        if (webSearchEnabled) {
            setWebSearchEnabled(false);
            showSwitchNotification(
                'Web Search Disabled',
                'Web search mode is now disabled',
                <Globe className="size-4" />,
                'default',
                'group'
            );
        } else {
            setWebSearchEnabled(true);
            showSwitchNotification(
                'Web Search Enabled',
                'Web search mode is now active',
                <Globe className="size-4" />,
                'web',
                'group'
            );
        }
    }, [webSearchEnabled, currentModelSupportsWeb, webSupportedModels, showSwitchNotification]);

    // Prevent hydration mismatch by not rendering theme-dependent content until mounted
    if (!mounted) {
        return (
            <div className="flex flex-col w-full">
                <TooltipProvider>
                    <div className="relative">
                        <div className="rounded-t-3xl pt-2 px-2 backdrop-blur-lg bg-background">
                            <div className="border-reflect rounded-t-2xl backdrop-blur-lg">
                                <div className="relative flex w-full flex-col items-stretch gap-2 rounded-t-2xl border-0 backdrop-blur-md px-3 pt-3 text-secondary-foreground outline-0 sm:max-w-3xl bg-background">
                                    <div className="w-full h-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                    <div className="flex justify-between items-center pt-3 mt-2 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                                            <div className="w-20 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                                        </div>
                                        <div className="w-16 h-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col w-full")} suppressHydrationWarning>
            <TooltipProvider>
                <div className="relative">
                    <SwitchNotification
                        icon={switchNotification.icon}
                        title={switchNotification.title}
                        description={switchNotification.description}
                        isVisible={switchNotification.show}
                        modelColor={switchNotification.notificationType === 'model' ?
                            models.find(m => m.value === selectedModel)?.color :
                            selectedGroup || undefined}
                        notificationType={switchNotification.notificationType}
                    />

                                         {/* Hidden file inputs */}
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        multiple
                         onChange={(e) => {
                             const files = Array.from(e.target.files || []);
                             console.log("Files selected:", files.length);
                             // Basic file handling - just log for now
                             if (files.length > 0) {
                                 toast.success(`${files.length} file(s) selected`);
                             }
                             e.target.value = '';
                         }}
                        accept={getAcceptFileTypes(selectedModel)}
                        tabIndex={-1}
                         suppressHydrationWarning
                    />
                    <input
                        type="file"
                        className="hidden"
                        ref={postSubmitFileInputRef}
                        multiple
                         onChange={(e) => {
                             const files = Array.from(e.target.files || []);
                             console.log("Post-submit files selected:", files.length);
                             // Basic file handling - just log for now
                             if (files.length > 0) {
                                 toast.success(`${files.length} file(s) selected`);
                             }
                             e.target.value = '';
                         }}
                        accept={getAcceptFileTypes(selectedModel)}
                        tabIndex={-1}
                         suppressHydrationWarning
                     />

                        <div className="rounded-t-3xl pt-2 px-2 backdrop-blur-lg bg-background" style={{
                         paddingBottom: "0px",
                         marginBottom: "0px"
                     } as React.CSSProperties} suppressHydrationWarning>
                            <div className="border-reflect rounded-t-2xl backdrop-blur-lg" style={{
                                "--gradientBorder-gradient": "linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))",
                                "--start": "#000000e0",
                                "--opacity": "0.6"
                            } as React.CSSProperties}>
                                <div className="relative flex w-full flex-col items-stretch gap-2 rounded-t-2xl border-0 backdrop-blur-md px-3 pt-3 text-secondary-foreground outline-0 sm:max-w-3xl bg-[rgb(249,239,250)] dark:bg-[rgb(40,34,44)]" style={{
                            marginBottom: "0px",
                            paddingBottom: "env(safe-area-inset-bottom)"
                        }} suppressHydrationWarning>
                            <Textarea
                                ref={inputRef}
                                placeholder={hasInteracted ? "Ask a new question..." : "Type your message here..."}
                                value={input}
                                onChange={handleInput}
                                disabled={isProcessing}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                className={cn(
                                    "w-full rounded-lg rounded-b-none md:text-base!",
                                    "text-base leading-relaxed",
                                "bg-[#f9effa] dark:bg-transparent",
                                "border-0! outline-0! shadow-none! ring-0!",
                                "text-foreground",
                                "focus:ring-0! focus-visible:ring-0! focus:border-0! focus:outline-0! focus:shadow-none! focus:ring-offset-0!",
                                "active:ring-0! active:border-0! active:outline-0! active:shadow-none! active:ring-offset-0!",
                                "hover:ring-0! hover:border-0! hover:outline-0! hover:shadow-none! hover:ring-offset-0!",
                                "px-0! py-0!",
                                    "touch-manipulation",
                                "whatsize",
                                "[&:focus]:ring-0! [&:focus]:border-0! [&:focus]:outline-0! [&:focus]:shadow-none!",
                                "[&:active]:ring-0! [&:active]:border-0! [&:active]:outline-0! [&:active]:shadow-none!"
                                )}
                                style={{
                                    WebkitUserSelect: 'text',
                                    WebkitTouchCallout: 'none',
                                    minHeight: width && width < 768 ? '40px' : undefined,
                                    resize: 'none',
                                }}
                                rows={1}
                                autoFocus={width ? width > 768 : true}
                                onCompositionStart={() => isCompositionActive.current = true}
                                onCompositionEnd={() => isCompositionActive.current = false}
                                onKeyDown={handleKeyDown}
                            suppressHydrationWarning
                            />

                        {/* Toolbar */}
                            <div
                                className={cn(
                                "flex justify-between items-center pt-3 mt-2 pb-3"
                                // Remove opacity and cursor styles that prevent interaction
                                )}
                            suppressHydrationWarning
                        >
                                                         <div ref={groupSelectorRef} className={cn("flex items-center gap-2 relative", isProcessing ? "opacity-50 cursor-not-allowed" : "")}>
                                 {/* Group selector button - shows selected group icon or route icon */}
                                 <Button
                                     variant="outline"
                                     size="icon"
                                     className={cn(
                                         "rounded-full h-8 w-8 border-secondary-foreground/10 transition-all duration-300 relative overflow-hidden",
                                         selectedGroup && actualGroupIds.includes(selectedGroup)
                                             ? "bg-[#b83268] hover:bg-[#a22b5a] text-white border-[#b83268] scale-110 animate-pulse shadow-md"
                                             : "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground shadow-sm hover:shadow-md scale-100"
                                     )}
                                     style={selectedGroup && actualGroupIds.includes(selectedGroup) ? {
                                         animation: 'pulse 2s ease-in-out infinite'
                                     } as React.CSSProperties : undefined}
                                     disabled={!!isProcessing}
                                     onClick={(e) => {
                                         e.preventDefault();
                                         e.stopPropagation();
                                         
                                         // If a group is selected, deselect it on click
                                         if (selectedGroup) {
                                             setSelectedGroup(null);
                                             showSwitchNotification(
                                                 'Chat Mode',
                                                 'No group selected - default chat mode',
                                                 <MessageCircle className="size-4" />,
                                                 'default',
                                                 'group'
                                             );
                                         } else {
                                             // If no group selected, open the selector
                                             setShowGroupSelector(!showGroupSelector);
                                             // Close model selector if it's open
                                             setModelSelectorOpen(false);
                                         }
                                     }} 
                                     suppressHydrationWarning
                                 >
                                     {/* Fill animation background */}
                                     {selectedGroup && actualGroupIds.includes(selectedGroup) && (
                                         <div 
                                             className="absolute inset-0 rounded-full opacity-30 animate-ping"
                                             style={{
                                                 background: 'radial-gradient(circle, rgba(184, 50, 104, 0.6) 0%, transparent 70%)',
                                                 animationDuration: '2s'
                                             } as React.CSSProperties}
                                         />
                                     )}
                                     
                                     {/* Icon - positioned above fill animation */}
                                     <div className="relative z-10">
                                         {selectedGroup && actualGroupIds.includes(selectedGroup) ? (
                                             (() => {
                                                 const group = searchGroups.find(g => g.id === selectedGroup);
                                                 return group ? <group.icon size={14} className="transition-transform duration-200" /> : <RouteIcon size={14} />;
                                             })()
                                         ) : (
                                             // Show route icon with rotation when dropdown is open
                                             <RouteIcon 
                                                 size={14}
                                                 className={cn(
                                                     "transition-transform duration-200",
                                                     showGroupSelector ? "rotate-180" : ""
                                                 )}
                                             />
                                         )}
                                     </div>
                                 </Button>

                                     <AnimatePresence>
                                     {showGroupSelector && (
                                         <motion.div
                                             initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                             animate={{ opacity: 1, scale: 1, y: 0 }}
                                             exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                             transition={{ 
                                                 type: "spring",
                                                 stiffness: 400,
                                                 damping: 30,
                                                 duration: 0.2
                                             }}
                                             className="absolute bottom-full left-0 mb-3 backdrop-blur-md rounded-xl shadow-xl border p-3 z-50 min-w-[220px] fix-pointer-events fix-z-index-higher"
                                             style={{
                                                 backgroundColor: 'rgb(15, 10, 14)',
                                                 borderColor: 'rgb(35, 30, 34)'
                                             }}
                                         >
                                             <div className="flex flex-col gap-1.5">
                                                 {searchGroups.filter(group => group.show).map((group, index) => (
                                                     <motion.div
                                                         key={group.id}
                                                         initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                                         animate={{ opacity: 1, x: 0, scale: 1 }}
                                                         transition={{ 
                                                             type: "spring",
                                                             stiffness: 500,
                                                             damping: 35,
                                                             delay: index * 0.03
                                                         }}
                                                     >
                                                         <Tooltip delayDuration={300}>
                                                             <TooltipTrigger asChild>
                                                                 <Button
                                                                     variant="ghost"
                                                                     className="w-full justify-start gap-3 h-11 px-3 transition-all duration-300 rounded-lg hover:scale-[1.02] active:scale-[0.98]"
                                                                     style={{
                                                                         backgroundColor: selectedGroup === group.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                                                         color: '#ffffff'
                                                                     }}
                                                                     onMouseEnter={(e) => {
                                                                         if (selectedGroup !== group.id) {
                                                                             e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                                                         }
                                                                     }}
                                                                     onMouseLeave={(e) => {
                                                                         if (selectedGroup !== group.id) {
                                                                             e.currentTarget.style.backgroundColor = 'transparent';
                                                                         }
                                                                     }}
                                                                     onClick={(e) => {
                                                                         e.preventDefault();
                                                                         e.stopPropagation();
                                                                         handleGroupSelect(group);
                                                                         setShowGroupSelector(false);
                                                                     }}
                                                                     disabled={!!isProcessing}
                                                                     suppressHydrationWarning
                                                                 >
                                                                     <group.icon className="h-4 w-4 flex-shrink-0" />
                                                                     <span className="text-sm font-medium">{group.name}</span>
                                                                 </Button>
                                                             </TooltipTrigger>
                                                             <TooltipContent
                                                                 side="right"
                                                                 sideOffset={8}
                                                                 className="border-0 shadow-lg backdrop-blur-xs py-2 px-3"
                                                             >
                                                                 <span className="text-[11px]">{group.description}</span>
                                                             </TooltipContent>
                                                         </Tooltip>
                                                     </motion.div>
                                                 ))}
                                    </div>
                                         </motion.div>
                                 )}
                                 </AnimatePresence>

                                    <div className={cn(
                                        "relative transition-all duration-300",
                                        (isMobile && isGroupSelectorExpanded)
                                            ? "opacity-0 invisible w-0"
                                            : "opacity-100 visible w-auto"
                                 )} suppressHydrationWarning>
                                        <ModelSwitcher
                                            selectedModel={selectedModel}
                                            setSelectedModel={setSelectedModel}
                                            showExperimentalModels={showExperimentalModels}
                                            attachments={attachments}
                                            messages={messages}
                                            status={status}
                                         isOpen={modelSelectorOpen}
                                         onOpenChange={setModelSelectorOpen}
                                         onGroupSelectorClose={() => setShowGroupSelector(false)}
                                            onFilterClick={() => {}}
                                            selectedFilters={undefined}
                                            onModelSelect={(model) => {
                                                const isVisionModel = model.vision === true;
                                                showSwitchNotification(
                                                    model.label,
                                                    isVisionModel
                                                        ? 'Vision model enabled - you can now attach images and PDFs'
                                                        : model.description,
                                                    typeof model.icon === 'string' ?
                                                        <img src={model.icon} alt={model.label} className="w-4 h-4 object-contain flex-shrink-0" /> :
                                                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                                            <model.icon className="w-full h-full max-w-4 max-h-4" />
                                                        </div>,
                                                    model.color,
                                                 'model'
                                                );
                                            }}
                                        />
                                        
                                                                
                                    </div>

                                    <div className={cn(
                                     "flex items-center gap-2 transition-all duration-300",
                                        (isMobile && isGroupSelectorExpanded)
                                            ? "opacity-0 invisible w-0"
                                            : "opacity-100 visible w-auto"
                                 )} suppressHydrationWarning>
                                     {/* Web Search Button */}
                                        {!isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={handleWebSearchToggle}
                                                        className={cn(
                                                            "flex items-center gap-1.5 h-8 transition-all duration-300",
                                                            "rounded-full border border-secondary-foreground/10",
                                                            "hover:shadow-md",
                                                            webSearchEnabled && currentModelSupportsWeb
                                                                ? "bg-blue-500 dark:bg-blue-500 text-white px-2"
                                                                : currentModelSupportsWeb
                                                                    ? "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground px-1.5 w-8"
                                                                    : "bg-background text-muted-foreground/50 hover:bg-muted/20 px-1.5 w-8 cursor-not-allowed opacity-60",
                                                        )}
                                                        suppressHydrationWarning
                                                    >
                                                        <Globe className="h-3.5 w-3.5 mx-auto" />
                                                        {webSearchEnabled && currentModelSupportsWeb && <span className="text-xs font-medium">Web Search</span>}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="border-0 shadow-lg backdrop-blur-xs py-2 px-3"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium text-[11px]">
                                                            {currentModelSupportsWeb ? "Web Search" : "Web Search Unavailable"}
                                                        </span>
                                                        <span className="text-[10px] text-white leading-tight">
                                                            {currentModelSupportsWeb 
                                                                ? "Search the web for information" 
                                                                : "Switch to a web-compatible model"}
                                                        </span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <button
                                                onClick={handleWebSearchToggle}
                                                className={cn(
                                                    "flex items-center gap-1.5 h-8 transition-all duration-300",
                                                    "rounded-full border border-secondary-foreground/10",
                                                    "hover:shadow-md",
                                                    webSearchEnabled && currentModelSupportsWeb
                                                        ? "bg-blue-500 dark:bg-blue-500 text-white px-2"
                                                        : currentModelSupportsWeb
                                                            ? "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground px-1.5 w-8"
                                                            : "bg-background text-muted-foreground/50 hover:bg-muted/20 px-1.5 w-8 cursor-not-allowed opacity-60",
                                                )}
                                                suppressHydrationWarning
                                            >
                                                <Globe className="h-3.5 w-3.5 mx-auto" />
                                                {webSearchEnabled && currentModelSupportsWeb && <span className="text-xs font-medium">Web Search</span>}
                                            </button>
                                        )}

                                     {/* Extreme Mode Button */}
                                     {!isMobile ? (
                                         <Tooltip delayDuration={300}>
                                             <TooltipTrigger asChild>
                                                 <button
                                                     onClick={(e) => {
                                                         e.preventDefault();
                                                         e.stopPropagation();
                                                         
                                                         // Check if current model supports extreme mode
                                                         if (!currentModelSupportsExtreme) {
                                                             showSwitchNotification(
                                                                 'Model Not Compatible',
                                                                 `Switch to a compatible model for Extreme Mode. Try ${extremeSupportedModels[0]?.label || 'GPT 4o'}`,
                                                                 <Telescope className="size-4" />,
                                                                 'purple',
                                                                 'model'
                                                             );
                                                             return;
                                                         }
                                                         
                                                         // Toggle extreme mode (separate from group selector)
                                                         if (extremeModeEnabled) {
                                                             setExtremeModeEnabled(false);
                                                             showSwitchNotification(
                                                                 'Extreme Mode Disabled',
                                                                 'Deep research mode is now disabled',
                                                                 <Telescope className="size-4" />,
                                                                 'default',
                                                                 'group'
                                                             );
                                                         } else {
                                                             setExtremeModeEnabled(true);
                                                             showSwitchNotification(
                                                                 'Extreme Mode Enabled',
                                                                 'Deep research mode is now active',
                                                                 <Telescope className="size-4" />,
                                                                 'extreme',
                                                                 'group'
                                                             );
                                                         }
                                                     }}
                                                     className={cn(
                                                         "flex items-center gap-1.5 h-8 transition-all duration-300",
                                                         "rounded-full border border-secondary-foreground/10",
                                                         "hover:shadow-md",
                                                             extremeModeEnabled && currentModelSupportsExtreme
                                                             ? "bg-purple-500 dark:bg-purple-500 text-white px-2"
                                                             : currentModelSupportsExtreme
                                                                 ? "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground px-1.5 w-8"
                                                                 : "bg-background text-muted-foreground/50 hover:bg-muted/20 px-1.5 w-8 cursor-not-allowed opacity-60",
                                                     )}
                                                     suppressHydrationWarning
                                                 >
                                                     <Telescope className="h-3.5 w-3.5 mx-auto" />
                                                         {extremeModeEnabled && currentModelSupportsExtreme && <span className="text-xs font-medium">Extreme Mode</span>}
                                                 </button>
                                             </TooltipTrigger>
                                             <TooltipContent
                                                 side="bottom"
                                                 sideOffset={6}
                                                 className="border-0 shadow-lg backdrop-blur-xs py-2 px-3"
                                             >
                                                 <div className="flex flex-col gap-0.5">
                                                     <span className="font-medium text-[11px]">Extreme Mode</span>
                                                     <span className="text-[10px] text-white leading-tight">
                                                         {currentModelSupportsExtreme ? 'Deep research mode' : 'Not available for current model'}
                                                     </span>
                                                 </div>
                                             </TooltipContent>
                                         </Tooltip>
                                     ) : (
                                         <button
                                             onClick={(e) => {
                                                 e.preventDefault();
                                                 e.stopPropagation();
                                                 
                                                 // Check if current model supports extreme mode
                                                 if (!currentModelSupportsExtreme) {
                                                     showSwitchNotification(
                                                         'Model Not Compatible',
                                                         `Switch to a compatible model for Extreme Mode. Try ${extremeSupportedModels[0]?.label || 'GPT 4o'}`,
                                                         <Telescope className="size-4" />,
                                                         'purple',
                                                         'model'
                                                     );
                                                     return;
                                                 }
                                                 
                                                 // Toggle extreme mode (separate from group selector)
                                                 if (extremeModeEnabled) {
                                                     setExtremeModeEnabled(false);
                                                     showSwitchNotification(
                                                         'Extreme Mode Disabled',
                                                         'Deep research mode is now disabled',
                                                         <Telescope className="size-4" />,
                                                         'default',
                                                         'group'
                                                     );
                                                 } else {
                                                     setExtremeModeEnabled(true);
                                                     showSwitchNotification(
                                                         'Extreme Mode Enabled',
                                                         'Deep research mode is now active',
                                                         <Telescope className="size-4" />,
                                                         'extreme',
                                                         'group'
                                                     );
                                                 }
                                             }}
                                             className={cn(
                                                 "flex items-center gap-1.5 h-8 transition-all duration-300",
                                                 "rounded-full border border-secondary-foreground/10",
                                                 "hover:shadow-md",
                                                 extremeModeEnabled && currentModelSupportsExtreme
                                                     ? "bg-purple-500 dark:bg-purple-500 text-white px-2"
                                                     : currentModelSupportsExtreme
                                                         ? "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground px-1.5 w-8"
                                                         : "bg-background text-muted-foreground/50 hover:bg-muted/20 px-1.5 w-8 cursor-not-allowed opacity-60",
                                             )}
                                             suppressHydrationWarning
                                         >
                                             <Telescope className="h-3.5 w-3.5 mx-auto" />
                                             {extremeModeEnabled && currentModelSupportsExtreme && <span className="text-xs font-medium">Extreme</span>}
                                         </button>
                                     )}


                                    </div>
                                </div>

                         

                                <div className="flex items-center gap-2" suppressHydrationWarning>
                                 {mounted && hasVisionSupport(selectedModel) && !(isMobile && isGroupSelectorExpanded) && (
                                        !isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:p-2"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            triggerFileInput();
                                                        }}
                                                        disabled={isProcessing}
                                                        suppressHydrationWarning
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip size-4">
                                                            <path d="M13.234 20.252 21 12.3"></path>
                                                            <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"></path>
                                                        </svg>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className=" border-0 shadow-lg backdrop-blur-xs py-2 px-3"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium text-[11px]">Attach File</span>
                                                        <span className="text-[10px] text-muted-foreground leading-tight">
                                                            {supportsPdfAttachments(selectedModel)
                                                                ? "Upload an image or PDF document"
                                                                : "Upload an image"}
                                                        </span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <button
                                                className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:p-2"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    triggerFileInput();
                                                }}
                                                disabled={isProcessing}
                                                suppressHydrationWarning
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip size-4">
                                                    <path d="M13.234 20.252 21 12.3"></path>
                                                    <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"></path>
                                                </svg>
                                            </button>
                                        )
                                    )}

                                 {mounted && (
                                     isProcessing ? (
                                        !isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="rounded-full p-1.5 h-8 w-8 pointer-events-auto" // Force pointer events to work
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            stop();
                                                        }}
                                                        variant="destructive"
                                                         suppressHydrationWarning
                                                    >
                                                        <StopIcon size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="border-0 shadow-lg backdrop-blur-xs py-2 px-3"
                                                >
                                                    <span className="font-medium text-[11px]">Stop Generation</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                className="rounded-full p-1.5 h-8 w-8 pointer-events-auto" // Force pointer events to work
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    stop();
                                                }}
                                                variant="destructive"
                                                 suppressHydrationWarning
                                            >
                                                <StopIcon size={14} />
                                            </Button>
                                        )
                                    ) : (
                                        !isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                         className="border-reflect button-reflect bg-[rgb(162,59,103)] font-semibold shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 w-9 relative rounded-lg p-2 text-pink-50"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            submitForm();
                                                        }}
                                                        disabled={input.length === 0 && attachments.length === 0 || uploadQueue.length > 0 || status !== 'ready'}
                                                         suppressHydrationWarning
                                                    >
                                                         <ArrowUpIcon size={14} className="!size-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="border-0 shadow-lg backdrop-blur-xs py-2 px-3"
                                                >
                                                    <span className="font-medium text-[11px]">Send Message</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                 className="border-reflect button-reflect bg-[rgb(162,59,103)] font-semibold shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 w-9 relative rounded-lg p-2 text-pink-50"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    submitForm();
                                                }}
                                                disabled={input.length === 0 && attachments.length === 0 || uploadQueue.length > 0 || status !== 'ready'}
                                                 suppressHydrationWarning
                                            >
                                                 <ArrowUpIcon size={14} className="!size-5" />
                                            </Button>
                                         )
                                     )
                                 )}
                                 
                                 {/* Fallback during hydration */}
                                 {!mounted && (
                                     <Button
                                         className="rounded-full p-1.5 h-8 w-8"
                                         disabled
                                         suppressHydrationWarning
                                     >
                                         <div className="w-[14px] h-[14px]" />
                                     </Button>
                                 )}
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </div>
    );
};

export default FormComponent;

