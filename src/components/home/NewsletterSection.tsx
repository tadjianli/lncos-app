"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Container } from "@/components/shared/Container";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="mt-12">
      <Container>
        <div
          className="relative overflow-hidden rounded-3xl p-7"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(201,169,110,0.03) 100%)",
            border: "1px solid rgba(201,169,110,0.15)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #C9A96E, transparent)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative z-10">
            <p className="text-[0.6rem] font-light tracking-[0.3em] uppercase text-[--gold] mb-2">
              Inner Circle
            </p>
            <h2
              className="font-light text-[--cream] leading-tight mb-2"
              style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem" }}
            >
              Privilege Access
            </h2>
            <p className="text-xs font-light text-[--cream-muted] leading-relaxed mb-5">
              Early access to limited editions, exclusive rituals, and curated content for members.
            </p>

            {submitted ? (
              <div className="text-center py-4">
                <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13.25" stroke="#C9A96E" strokeWidth="1.5" />
                  <path d="M8.5 14l4 4 7-8" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs font-light text-[--gold] tracking-wider">
                  Welcome to the Inner Circle
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full h-11 px-4 rounded-full text-xs font-light text-[--cream] placeholder:text-[--cream-muted]/40 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(8,8,8,0.6)",
                    border: "1px solid rgba(201,169,110,0.15)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,169,110,0.15)";
                  }}
                />
                <Button type="submit" variant="gold" size="md" className="w-full">
                  Join the Circle
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
