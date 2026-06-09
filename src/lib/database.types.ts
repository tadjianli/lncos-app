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
          usage_tips: string[];
          section_toggles: Json;
          extra_sections: Json;
          commitments: Json;
          active: boolean;
          image_url: string | null;
          main_image_url: string | null;
          gallery_images: string[];
          thumbnail_images: string[];
          home_visibility: Json;
          video_url: string | null;
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
          usage_tips?: string[];
          section_toggles?: Json;
          extra_sections?: Json;
          commitments?: Json;
          active?: boolean;
          image_url?: string | null;
          main_image_url?: string | null;
          gallery_images?: string[];
          thumbnail_images?: string[];
          home_visibility?: Json;
          video_url?: string | null;
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
          usage_tips?: string[];
          section_toggles?: Json;
          extra_sections?: Json;
          commitments?: Json;
          active?: boolean;
          image_url?: string | null;
          main_image_url?: string | null;
          gallery_images?: string[];
          thumbnail_images?: string[];
          home_visibility?: Json;
          video_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          stock: number;
          sku: string;
          image_url: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price: number;
          stock?: number;
          sku?: string;
          image_url?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          name?: string;
          price?: number;
          stock?: number;
          sku?: string;
          image_url?: string | null;
          position?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
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
          discount: number;
          promo_code: string | null;
          total: number;
          tracking_number: string | null;
          estimated_delivery: string | null;
          delivered_at: string | null;
          shipping_address: Json | null;
          sumup_checkout_id: string | null;
          stripe_session_id: string | null;
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
          discount?: number;
          promo_code?: string | null;
          total: number;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          delivered_at?: string | null;
          shipping_address?: Json | null;
          sumup_checkout_id?: string | null;
          stripe_session_id?: string | null;
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
          stripe_session_id?: string | null;
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
          stripe_session_id: string | null;
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
          stripe_session_id?: string | null;
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
          stripe_session_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      rdv_settings: {
        Row: {
          id: string;
          hero_eyebrow: string;
          hero_title: string;
          hero_subtitle: string;
          cta_label: string;
          trust_1_icon: string;
          trust_1_text: string;
          trust_2_icon: string;
          trust_2_text: string;
          trust_3_icon: string;
          trust_3_text: string;
          confirm_title: string;
          confirm_reminder: string;
          location_name: string;
          deposit_enabled: boolean;
          deposit_type: "percent" | "fixed";
          deposit_value: number;
          deposit_label: string;
          deposit_min_amount: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hero_eyebrow?: string;
          hero_title?: string;
          hero_subtitle?: string;
          cta_label?: string;
          trust_1_icon?: string;
          trust_1_text?: string;
          trust_2_icon?: string;
          trust_2_text?: string;
          trust_3_icon?: string;
          trust_3_text?: string;
          confirm_title?: string;
          confirm_reminder?: string;
          location_name?: string;
          deposit_enabled?: boolean;
          deposit_type?: "percent" | "fixed";
          deposit_value?: number;
          deposit_label?: string;
          deposit_min_amount?: number;
          updated_at?: string;
        };
        Update: {
          hero_eyebrow?: string;
          hero_title?: string;
          hero_subtitle?: string;
          cta_label?: string;
          trust_1_icon?: string;
          trust_1_text?: string;
          trust_2_icon?: string;
          trust_2_text?: string;
          trust_3_icon?: string;
          trust_3_text?: string;
          confirm_title?: string;
          confirm_reminder?: string;
          location_name?: string;
          deposit_enabled?: boolean;
          deposit_type?: "percent" | "fixed";
          deposit_value?: number;
          deposit_label?: string;
          deposit_min_amount?: number;
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
          page_slug: string;
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
          page_slug?: string;
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
          page_slug?: string;
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

      promotions: {
        Row: {
          id: string;
          code: string;
          description: string;
          type: "percentage" | "fixed" | "shipping";
          value: number;
          is_active: boolean;
          expires_at: string | null;
          max_uses: number | null;
          current_uses: number;
          free_shipping: boolean;
          minimum_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string;
          type?: "percentage" | "fixed" | "shipping";
          value?: number;
          is_active?: boolean;
          expires_at?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          free_shipping?: boolean;
          minimum_order?: number;
          created_at?: string;
        };
        Update: {
          code?: string;
          description?: string;
          type?: "percentage" | "fixed" | "shipping";
          value?: number;
          is_active?: boolean;
          expires_at?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          free_shipping?: boolean;
          minimum_order?: number;
        };
        Relationships: [];
      };

      admin_push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      product_reviews: {
        Row: {
          id: string;
          user_id: string | null;
          order_id: string | null;
          product_id: string | null;
          product_name: string;
          author_name: string;
          author_email: string | null;
          author_photo_url: string | null;
          title: string;
          rating: number;
          body: string;
          status: string;
          verified: boolean;
          featured: boolean;
          pinned: boolean;
          homepage_featured: boolean;
          review_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_id?: string | null;
          product_id?: string | null;
          product_name?: string;
          author_name: string;
          author_email?: string | null;
          author_photo_url?: string | null;
          title?: string;
          rating: number;
          body: string;
          status?: string;
          verified?: boolean;
          featured?: boolean;
          pinned?: boolean;
          homepage_featured?: boolean;
          review_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          order_id?: string | null;
          product_id?: string | null;
          product_name?: string;
          author_name?: string;
          author_email?: string | null;
          author_photo_url?: string | null;
          title?: string;
          rating?: number;
          body?: string;
          status?: string;
          verified?: boolean;
          featured?: boolean;
          pinned?: boolean;
          homepage_featured?: boolean;
          review_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      review_images: {
        Row: {
          id: string;
          review_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          review_id?: string;
          image_url?: string;
        };
        Relationships: [];
      };

      before_after_results: {
        Row: {
          id: string;
          product_id: string;
          review_id: string | null;
          before_image_url: string;
          after_image_url: string;
          description: string;
          result_duration: string;
          result_duration_custom: string | null;
          featured: boolean;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          review_id?: string | null;
          before_image_url: string;
          after_image_url: string;
          description?: string;
          result_duration?: string;
          result_duration_custom?: string | null;
          featured?: boolean;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          review_id?: string | null;
          before_image_url?: string;
          after_image_url?: string;
          description?: string;
          result_duration?: string;
          result_duration_custom?: string | null;
          featured?: boolean;
          pinned?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      social_proof_settings: {
        Row: {
          id: string;
          purchase_notifications: boolean;
          review_notifications: boolean;
          favorite_notifications: boolean;
          cart_notifications: boolean;
          live_viewers_enabled: boolean;
          stock_alerts_enabled: boolean;
          sales_counter_enabled: boolean;
          rotation_interval_sec: number;
          notification_duration_ms: number;
          viewers_min: number;
          viewers_max: number;
          stock_low_threshold: number;
          trust_fast_delivery: boolean;
          trust_secure_payment: boolean;
          trust_verified_purchase: boolean;
          trust_easy_returns: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_notifications?: boolean;
          review_notifications?: boolean;
          favorite_notifications?: boolean;
          cart_notifications?: boolean;
          live_viewers_enabled?: boolean;
          stock_alerts_enabled?: boolean;
          sales_counter_enabled?: boolean;
          rotation_interval_sec?: number;
          notification_duration_ms?: number;
          viewers_min?: number;
          viewers_max?: number;
          stock_low_threshold?: number;
          trust_fast_delivery?: boolean;
          trust_secure_payment?: boolean;
          trust_verified_purchase?: boolean;
          trust_easy_returns?: boolean;
        };
        Update: {
          purchase_notifications?: boolean;
          review_notifications?: boolean;
          favorite_notifications?: boolean;
          cart_notifications?: boolean;
          live_viewers_enabled?: boolean;
          stock_alerts_enabled?: boolean;
          sales_counter_enabled?: boolean;
          rotation_interval_sec?: number;
          notification_duration_ms?: number;
          viewers_min?: number;
          viewers_max?: number;
          stock_low_threshold?: number;
          trust_fast_delivery?: boolean;
          trust_secure_payment?: boolean;
          trust_verified_purchase?: boolean;
          trust_easy_returns?: boolean;
        };
        Relationships: [];
      };

      social_proof_events: {
        Row: {
          id: string;
          event_type: string;
          product_id: string | null;
          product_name: string;
          customer_name: string;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          product_id?: string | null;
          product_name?: string;
          customer_name: string;
          rating?: number | null;
        };
        Update: {
          event_type?: string;
          product_id?: string | null;
          product_name?: string;
          customer_name?: string;
          rating?: number | null;
        };
        Relationships: [];
      };

      shipping_methods: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          estimated_days: string;
          icon: string;
          is_active: boolean;
          is_free: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price?: number;
          estimated_days?: string;
          icon?: string;
          is_active?: boolean;
          is_free?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          price?: number;
          estimated_days?: string;
          icon?: string;
          is_active?: boolean;
          is_free?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: {
      increment_promo_uses: {
        Args: { promo_code_arg: string };
        Returns: undefined;
      };
      get_product_sales_stats: {
        Args: { p_product_id: string };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
