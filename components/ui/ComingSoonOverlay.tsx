import { Sparkles } from "lucide-react";

export default function ComingSoonOverlay({ title, description }: { title: string, description: string }) {
    return (
        <div className="absolute inset-0 z-50 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Decorative background gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-orange-500/5 blur-3xl -z-10" />

                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 mb-6">{description}</p>

                <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-sm font-medium">
                    Coming Soon
                </div>
            </div>
        </div>
    )
}
