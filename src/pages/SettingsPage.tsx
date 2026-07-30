import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  LayoutTemplate,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ServicesHero, SocialLinks, WebsiteSettings } from "@/types/models";
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
          <TabsTrigger value="services-hero">
            <LayoutTemplate className="h-4 w-4" /> Services Hero
          </TabsTrigger>
          <TabsTrigger value="home-hero">
            <LayoutTemplate className="h-4 w-4" /> Home Hero
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4" /> Social Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website">
          <WebsiteForm canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="services-hero">
          <ServicesHeroForm canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="home-hero">
          <HomeHeroForm canEdit={canEdit} />
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
            <Field label="Theme primary color">
              <div className="flex gap-2">
                <Input type="color" {...register("theme_primary")} disabled={!canEdit} className="w-12 p-1 h-10" />
                <Input type="text" {...register("theme_primary")} disabled={!canEdit} placeholder="#0f172a" />
              </div>
            </Field>
            <Field label="Theme accent color">
              <div className="flex gap-2">
                <Input type="color" {...register("theme_accent")} disabled={!canEdit} className="w-12 p-1 h-10" />
                <Input type="text" {...register("theme_accent")} disabled={!canEdit} placeholder="#3b82f6" />
              </div>
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

type HeroFormValues = { services_hero: ServicesHero };

function ServicesHeroForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<HeroFormValues>({
    defaultValues: { services_hero: { title: "", subtitle: "", background_image: null, stats: [] } },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "services_hero.stats" });

  useEffect(() => {
    if (data) {
      reset({
        services_hero: {
          title: data.services_hero?.title ?? "",
          subtitle: data.services_hero?.subtitle ?? "",
          background_image: data.services_hero?.background_image ?? null,
          stats: data.services_hero?.stats ?? [],
        },
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) => settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("Services hero saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[420px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({ services_hero: v.services_hero }))}>
      <Card>
        <CardHeader>
          <CardTitle>Services page hero</CardTitle>
          <CardDescription>
            Headline, background image and highlight stats shown at the top of the Services page. Call / WhatsApp
            buttons use the phone &amp; WhatsApp numbers from the Website tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field label="Heading">
            <Input
              placeholder="Trusted Home Healthcare Services in Gurgaon & Delhi NCR"
              {...register("services_hero.title")}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              rows={3}
              placeholder="Compassionate and reliable home healthcare for seniors, patients and recovering individuals…"
              {...register("services_hero.subtitle")}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Background image">
            <Controller
              control={control}
              name="services_hero.background_image"
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  folder="nupun/hero"
                  aspect="wide"
                />
              )}
            />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Highlight stats</Label>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "", label: "" })}
                >
                  <Plus className="h-4 w-4" /> Add stat
                </Button>
              )}
            </div>
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No stats yet. Add up to four (e.g. “24/7” → “Patient Support”).</p>
            )}
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-end gap-3">
                  <div className="w-32 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    <Input placeholder="24/7" {...register(`services_hero.stats.${i}.value` as const)} disabled={!canEdit} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Label</Label>
                    <Input placeholder="Patient Support" {...register(`services_hero.stats.${i}.label` as const)} disabled={!canEdit} />
                  </div>
                  {canEdit && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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

type HomeHeroFormValues = { home_hero: WebsiteSettings["home_hero"] };

function HomeHeroForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<HomeHeroFormValues>({
    defaultValues: { home_hero: { trust_badge_text: "", trust_badge_quote: "", trust_badge_avatars: [], slider_images: [] } },
  });
  const avatarsField = useFieldArray({ control, name: "home_hero.trust_badge_avatars" });
  const sliderField = useFieldArray({ control, name: "home_hero.slider_images" });

  useEffect(() => {
    if (data) {
      reset({
        home_hero: {
          trust_badge_text: data.home_hero?.trust_badge_text ?? "",
          trust_badge_quote: data.home_hero?.trust_badge_quote ?? "",
          trust_badge_avatars: data.home_hero?.trust_badge_avatars ?? [],
          slider_images: data.home_hero?.slider_images ?? [],
        },
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) => settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("Home hero saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[420px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({ home_hero: v.home_hero }))}>
      <Card>
        <CardHeader>
          <CardTitle>Home page hero</CardTitle>
          <CardDescription>
            Manage the background slider images and the floating Trust Badge details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Slider Images</Label>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => sliderField.append({ url: "" })}
                >
                  <Plus className="h-4 w-4" /> Add Image
                </Button>
              )}
            </div>
            {sliderField.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No slider images uploaded. Default premium images will be used.</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sliderField.fields.map((f, i) => (
                <div key={f.id} className="relative group">
                  <Controller
                    control={control}
                    name={`home_hero.slider_images.${i}`}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value ?? undefined}
                        onChange={field.onChange}
                        folder="nupun/hero"
                        aspect="wide"
                      />
                    )}
                  />
                  {canEdit && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => sliderField.remove(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Trust Badge</h3>
            <div className="space-y-6">
              <Field label="Trust Badge Text">
                <Input
                  placeholder="Trusted by 5,000+"
                  {...register("home_hero.trust_badge_text")}
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Trust Badge Quote">
                <Textarea
                  rows={2}
                  placeholder='"Their nursing staff is extremely professional..."'
                  {...register("home_hero.trust_badge_quote")}
                  disabled={!canEdit}
                />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Avatars (Small overlapping circles)</Label>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => avatarsField.append({ url: "" })}
                    >
                      <Plus className="h-4 w-4" /> Add Avatar
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-4">
                  {avatarsField.fields.map((f, i) => (
                    <div key={f.id} className="relative group w-20 h-20">
                      <Controller
                        control={control}
                        name={`home_hero.trust_badge_avatars.${i}`}
                        render={({ field }) => (
                          <ImageUpload
                            value={field.value ?? undefined}
                            onChange={field.onChange}
                            folder="nupun/hero"
                            aspect="square"
                          />
                        )}
                      />
                      {canEdit && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => avatarsField.remove(i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
