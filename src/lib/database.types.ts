/**
 * LN COS — Supabase Database types (matches migration 001)
 * Regenerate: npx supabase gen types typescript --project-id svxgeoklhylqivszedel
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      products: {
        Row: {
          id: string;
          name: string;
          cat: string;
          price: number;
          old_price: number | null;
          ml: string;
          rating: number;
          reviews: number;
          tag: string | null;
          stock: number;
          variants: string[];
          description: string;
          ingredients: string[];
          active: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cat: string;
          price: number;
          old_price?: number | null;
          ml?: string;
          rating?: number;
          reviews?: number;
          tag?: string | null;
          stock?: number;
          variants?: string[];
          description?: string;
          ingredients?: string[];
          active?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          cat?: string;
          price?: number;
          old_price?: number | null;
          ml?: string;
          rating?: number;
          reviews?: number;
          tag?: string | null;
          stock?: number;
          variants?: string[];
          description?: string;
          ingredients?: string[];
          active?: boolean;
          image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      categories: {
        Row: {
          id: string;
          name: string;
          count: number;
          cover_url: string | null;
          position: number;
        };
        Insert: {
          id: string;
          name: string;
          count?: number;
          cover_url?: string | null;
          position?: number;
        };
        Update: {
          name?: string;
          count?: number;
          cover_url?: string | null;
          position?: number;
        };
        Relationships: [];
      };

      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant: string;
          qty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant: string;
          qty?: number;
          created_at?: string;
        };
        Update: { qty?: number };
        Relationships: [];
      };

      favorites: {
        Row: { user_id: string; product_id: string; created_at: string };
        Insert: { user_id: string; product_id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";
          payment_status: "pending" | "paid" | "refunded";
          subtotal: number;
          shipping_cost: number;
          total: number;
          tracking_number: string | null;
          estimated_delivery: string | null;
          delivered_at: string | null;
          shipping_address: Json | null;
          sumup_checkout_id: string | null;
          payment_provider: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";
          payment_status?: "pending" | "paid" | "refunded";
          subtotal: number;
          shipping_cost?: number;
          total: number;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          delivered_at?: string | null;
          shipping_address?: Json | null;
          sumup_checkout_id?: string | null;
          payment_provider?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";
          payment_status?: "pending" | "paid" | "refunded";
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          delivered_at?: string | null;
          sumup_checkout_id?: string | null;
          payment_provider?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          name: string;
          price: number;
          qty: number;
          variant: string | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          name: string;
          price: number;
          qty: number;
          variant?: string | null;
          image_url?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      appointments: {
        Row: {
          id: string;
          user_id: string | null;
          service_id: string;
          staff_id: string;
          extras_ids: string[];
          start_at: string;
          duration_min: number;
          price: number;
          deposit: number;
          payment_status: "unpaid" | "deposit" | "paid";
          status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          client_name: string;
          client_phone: string | null;
          client_email: string | null;
          notes: string | null;
          loyalty_pts_earned: number;
          confirmation_ref: string;
          source: "client" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          service_id: string;
          staff_id: string;
          extras_ids?: string[];
          start_at: string;
          duration_min: number;
          price: number;
          deposit?: number;
          payment_status?: "unpaid" | "deposit" | "paid";
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          client_name: string;
          client_phone?: string | null;
          client_email?: string | null;
          notes?: string | null;
          loyalty_pts_earned?: number;
          confirmation_ref: string;
          source?: "client" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          service_id?: string;
          staff_id?: string;
          extras_ids?: string[];
          start_at?: string;
          duration_min?: number;
          price?: number;
          deposit?: number;
          payment_status?: "unpaid" | "deposit" | "paid";
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          client_name?: string;
          client_phone?: string | null;
          client_email?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: "promo" | "order" | "points" | "new_product" | "rdv_reminder" | "system";
          title: string;
          body: string;
          unread: boolean;
          meta: Json | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: "promo" | "order" | "points" | "new_product" | "rdv_reminder" | "system";
          title: string;
          body: string;
          unread?: boolean;
          meta?: Json | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: { unread?: boolean };
        Relationships: [];
      };

      loyalty_points: {
        Row: {
          user_id: string;
          points: number;
          total_earned: number;
          tier: "bronze" | "argent" | "or" | "platine";
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          points?: number;
          total_earned?: number;
          tier?: "bronze" | "argent" | "or" | "platine";
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          points?: number;
          total_earned?: number;
          tier?: "bronze" | "argent" | "or" | "platine";
          updated_at?: string;
        };
        Relationships: [];
      };

      loyalty_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "earn" | "redeem" | "expire" | "bonus";
          pts: number;
          description: string;
          ref_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "earn" | "redeem" | "expire" | "bonus";
          pts: number;
          description: string;
          ref_id?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      home_sections: {
        Row: {
          id: string;
          type: string;
          name: string;
          enabled: boolean;
          variant: string;
          title: string;
          subtitle: string | null;
          eyebrow: string | null;
          title_accent: string | null;
          cta: string | null;
          source: string | null;
          img: string | null;
          device: "all" | "mobile" | "desktop";
          audience: "all" | "vip" | "logged_in";
          schedule: Json;
          views: number;
          position: number;
          is_draft: boolean;
          updated_at: string;
        };
        Insert: {
          id: string;
          type: string;
          name: string;
          enabled?: boolean;
          variant?: string;
          title: string;
          subtitle?: string | null;
          eyebrow?: string | null;
          title_accent?: string | null;
          cta?: string | null;
          source?: string | null;
          img?: string | null;
          device?: "all" | "mobile" | "desktop";
          audience?: "all" | "vip" | "logged_in";
          schedule?: Json;
          views?: number;
          position?: number;
          is_draft?: boolean;
          updated_at?: string;
        };
        Update: {
          type?: string;
          name?: string;
          enabled?: boolean;
          variant?: string;
          title?: string;
          subtitle?: string | null;
          eyebrow?: string | null;
          title_accent?: string | null;
          cta?: string | null;
          source?: string | null;
          img?: string | null;
          device?: "all" | "mobile" | "desktop";
          audience?: "all" | "vip" | "logged_in";
          schedule?: Json;
          views?: number;
          position?: number;
          is_draft?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      popups: {
        Row: {
          id: string;
          name: string;
          enabled: boolean;
          type: string;
          layout: string;
          eyebrow: string;
          title: string;
          subtitle: string;
          code: string;
          cta_label: string;
          cta_action: string;
          email_capture: boolean;
          accent: string;
          image: boolean;
          image_id: string;
          delay_sec: number;
          trigger_type: string;
          frequency: Json;
          audience: string;
          device: string;
          pages: string[];
          countdown: Json;
          schedule: Json;
          stats: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          enabled?: boolean;
          type?: string;
          layout?: string;
          eyebrow?: string;
          title?: string;
          subtitle?: string;
          code?: string;
          cta_label?: string;
          cta_action?: string;
          email_capture?: boolean;
          accent?: string;
          image?: boolean;
          image_id?: string;
          delay_sec?: number;
          trigger_type?: string;
          frequency?: Json;
          audience?: string;
          device?: string;
          pages?: string[];
          countdown?: Json;
          schedule?: Json;
          stats?: Json;
          updated_at?: string;
        };
        Update: {
          name?: string;
          enabled?: boolean;
          type?: string;
          layout?: string;
          eyebrow?: string;
          title?: string;
          subtitle?: string;
          code?: string;
          cta_label?: string;
          cta_action?: string;
          email_capture?: boolean;
          accent?: string;
          image?: boolean;
          image_id?: string;
          delay_sec?: number;
          trigger_type?: string;
          frequency?: Json;
          audience?: string;
          device?: string;
          pages?: string[];
          countdown?: Json;
          schedule?: Json;
          stats?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };

      services: {
        Row: {
          id: string;
          cat: string;
          name: string;
          price: number;
          duration: number;
          color: string;
          popular: boolean;
          active: boolean;
          description: string;
        };
        Insert: {
          id: string;
          cat: string;
          name: string;
          price: number;
          duration: number;
          color?: string;
          popular?: boolean;
          active?: boolean;
          description?: string;
        };
        Update: {
          cat?: string;
          name?: string;
          price?: number;
          duration?: number;
          color?: string;
          popular?: boolean;
          active?: boolean;
          description?: string;
        };
        Relationships: [];
      };

      staff: {
        Row: {
          id: string;
          name: string;
          role: string;
          color: string;
          rating: number;
          reviews: number;
          active: boolean;
          specialties: string[];
          services: string[];
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          name: string;
          role?: string;
          color?: string;
          rating?: number;
          reviews?: number;
          active?: boolean;
          specialties?: string[];
          services?: string[];
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          role?: string;
          color?: string;
          rating?: number;
          reviews?: number;
          active?: boolean;
          specialties?: string[];
          services?: string[];
          avatar_url?: string | null;
        };
        Relationships: [];
      };

      extras: {
        Row: {
          id: string;
          name: string;
          price: number;
          duration: number;
        };
        Insert: {
          id: string;
          name: string;
          price: number;
          duration: number;
        };
        Update: {
          name?: string;
          price?: number;
          duration?: number;
        };
        Relationships: [];
      };

      availability: {
        Row: {
          day: number;
          label: string;
          closed: boolean;
          open: string;
          close: string;
        };
        Insert: {
          day: number;
          label: string;
          closed?: boolean;
          open?: string;
          close?: string;
        };
        Update: {
          label?: string;
          closed?: boolean;
          open?: string;
          close?: string;
        };
        Relationships: [];
      };

      blocked_slots: {
        Row: {
          id: string;
          date: string;
          slot_start: string;
          slot_end: string;
          staff_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          slot_start: string;
          slot_end: string;
          staff_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          date?: string;
          slot_start?: string;
          slot_end?: string;
          staff_id?: string | null;
          reason?: string | null;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
