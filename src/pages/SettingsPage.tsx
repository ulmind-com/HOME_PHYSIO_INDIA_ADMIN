import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import {
  Settings as SettingsIcon,
  Globe,
  Share2,
  Save,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { SocialLinks, WebsiteSettings } from "@/types/models";
import { settingsService } from "@/services/settings.service";
import { normalizeError } from "@/services/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { env } from "@/config/env";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/common/ImageUpload";

export function SettingsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("settings:update");

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Website Settings · {env.APP_NAME}</title>
      </Helmet>
      <PageHeader
        title="Website Settings"
        description="Manage your brand identity, contact details and social presence."
        icon={<SettingsIcon />}
      />

      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">
            <Globe className="h-4 w-4" /> Website
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4" /> Social Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website">
          <WebsiteForm canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="social">
          <SocialForm canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WebsiteForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<WebsiteSettings>();
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) =>
      settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[420px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <Card>
        <CardHeader>
          <CardTitle>Brand & contact</CardTitle>
          <CardDescription>Core information about your organisation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Website name">
              <Input {...register("website_name")} disabled={!canEdit} />
            </Field>
            <Field label="Tagline">
              <Input {...register("tagline")} disabled={!canEdit} />
            </Field>
            <Field label="Email">
              <Input type="email" {...register("email")} disabled={!canEdit} />
            </Field>
            <Field label="Phone">
              <Input {...register("phone")} disabled={!canEdit} />
            </Field>
            <Field label="WhatsApp">
              <Input {...register("whatsapp")} disabled={!canEdit} />
            </Field>
            <Field label="Google Reviews link">
              <Input {...register("google_reviews_link")} disabled={!canEdit} />
            </Field>
          </div>

          <Field label="Address">
            <Textarea {...register("address")} rows={2} disabled={!canEdit} />
          </Field>
          <Field label="Google Maps embed URL">
            <Textarea {...register("google_map_embed")} rows={2} disabled={!canEdit} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Logo">
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="nupun/brand"
                    aspect="wide"
                  />
                )}
              />
            </Field>
            <Field label="Favicon">
              <Controller
                control={control}
                name="favicon"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="nupun/brand"
                    aspect="square"
                  />
                )}
              />
            </Field>
          </div>
        </CardContent>
        {canEdit && (
          <div className="flex justify-end border-t border-border bg-muted/30 px-6 py-4">
            <Button type="submit" loading={mutation.isPending}>
              <Save /> Save changes
            </Button>
          </div>
        )}
      </Card>
    </form>
  );
}

const SOCIAL_FIELDS: { name: keyof SocialLinks; label: string; icon: typeof Facebook }[] = [
  { name: "facebook", label: "Facebook", icon: Facebook },
  { name: "instagram", label: "Instagram", icon: Instagram },
  { name: "linkedin", label: "LinkedIn", icon: Linkedin },
  { name: "youtube", label: "YouTube", icon: Youtube },
  { name: "twitter", label: "Twitter / X", icon: Twitter },
  { name: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

function SocialForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "social"],
    queryFn: () => settingsService.getSocial(),
  });
  const { register, handleSubmit, reset } = useForm<SocialLinks>();
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<SocialLinks>) => settingsService.updateSocial(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "social"] });
      toast.success("Social links saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[360px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <Card>
        <CardHeader>
          <CardTitle>Social profiles</CardTitle>
          <CardDescription>Links displayed across your website.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <f.icon className="h-4 w-4 text-muted-foreground" /> {f.label}
              </Label>
              <Input
                placeholder="https://…"
                {...register(f.name)}
                disabled={!canEdit}
              />
            </div>
          ))}
        </CardContent>
        {canEdit && (
          <div className="flex justify-end border-t border-border bg-muted/30 px-6 py-4">
            <Button type="submit" loading={mutation.isPending}>
              <Save /> Save changes
            </Button>
          </div>
        )}
      </Card>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
