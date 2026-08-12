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
  Info,
  Layers,
  Scale,
  Home,
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
          <TabsTrigger value="home-about">
            <Home className="h-4 w-4" /> Home About
          </TabsTrigger>

          <TabsTrigger value="content">
            <Layers className="h-4 w-4" /> Content Sections
          </TabsTrigger>
          <TabsTrigger value="legal">
            <Scale className="h-4 w-4" /> Legal & Footer
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
        <TabsContent value="home-about">
          <HomeAboutForm canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="content">
          <ContentSectionsForm canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="legal">
          <LegalAndFooterForm canEdit={canEdit} />
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

type HomeHeroFormValues = {
  home_hero: WebsiteSettings["home_hero"];
  hero_headline: string;
  hero_subtitle: string;
  hero_description: string;
};

function HomeHeroForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<HomeHeroFormValues>({
    defaultValues: { 
      home_hero: { trust_badge_text: "", trust_badge_quote: "", trust_badge_avatars: [], slider_images: [], stats: [] },
      hero_headline: "",
      hero_subtitle: "",
      hero_description: "",
    },
  });
  const avatarsField = useFieldArray({ control, name: "home_hero.trust_badge_avatars" });
  const sliderField = useFieldArray({ control, name: "home_hero.slider_images" });
  const statsField = useFieldArray({ control, name: "home_hero.stats" });

  useEffect(() => {
    if (data) {
      reset({
        home_hero: {
          trust_badge_text: data.home_hero?.trust_badge_text ?? "",
          trust_badge_quote: data.home_hero?.trust_badge_quote ?? "",
          trust_badge_avatars: data.home_hero?.trust_badge_avatars ?? [],
          slider_images: data.home_hero?.slider_images ?? [],
          stats: data.home_hero?.stats ?? [],
        },
        hero_headline: data.hero_headline ?? "",
        hero_subtitle: data.hero_subtitle ?? "",
        hero_description: data.hero_description ?? "",
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
    <form onSubmit={handleSubmit((v) => mutation.mutate({ 
      home_hero: v.home_hero,
      hero_headline: v.hero_headline,
      hero_subtitle: v.hero_subtitle,
      hero_description: v.hero_description
    }))}>
      <Card>
        <CardHeader>
          <CardTitle>Home page hero</CardTitle>
          <CardDescription>
            Manage the hero text content, background slider images and the floating Trust Badge details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6 pt-2 pb-6 border-b">
            <Field label="Hero Headline">
              <Input
                placeholder="Trusted Home Health Care at Your Doorstep"
                {...register("hero_headline")}
                disabled={!canEdit}
              />
            </Field>
            <Field label="Hero Subtitle">
              <Input
                placeholder="Har Pal Aapke Apno Ke Sath"
                {...register("hero_subtitle")}
                disabled={!canEdit}
              />
            </Field>
            <Field label="Hero Description">
              <Textarea
                rows={3}
                placeholder="Trusted Home Nursing, Patient Attendant, Elderly Care..."
                {...register("hero_description")}
                disabled={!canEdit}
              />
            </Field>
          </div>

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Highlight Stats</h3>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => statsField.append({ value: 0, suffix: "+", label: "" })}
                >
                  <Plus className="h-4 w-4" /> Add Stat
                </Button>
              )}
            </div>
            {statsField.fields.length === 0 && (
              <p className="text-sm text-muted-foreground mb-4">No stats added yet. Add up to 3 stats (e.g. 100+ Verified Caregivers).</p>
            )}
            <div className="space-y-4">
              {statsField.fields.map((f, i) => (
                <div key={f.id} className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/10 relative group">
                  <div className="w-24 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Value (Number)</Label>
                    <Input type="number" placeholder="100" {...register(`home_hero.stats.${i}.value` as const, { valueAsNumber: true })} disabled={!canEdit} />
                  </div>
                  <div className="w-24 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Suffix</Label>
                    <Input placeholder="+" {...register(`home_hero.stats.${i}.suffix` as const)} disabled={!canEdit} />
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-[200px]">
                    <Label className="text-xs text-muted-foreground">Label</Label>
                    <Input placeholder="Verified Caregivers" {...register(`home_hero.stats.${i}.label` as const)} disabled={!canEdit} />
                  </div>
                  {canEdit && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => statsField.remove(i)}>
                      <Trash2 className="h-4 w-4" />
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

function AboutForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<WebsiteSettings>();
  const statsField = useFieldArray({ control, name: "about_stats" });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) => settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("About page settings saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <Card>
        <CardHeader>
          <CardTitle>About Page Settings</CardTitle>
          <CardDescription>Manage hero, story, and stats on the About Us page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field label="Hero Badge (e.g. ABOUT NUPUN)">
            <Input {...register("about_hero_badge")} disabled={!canEdit} />
          </Field>
          <Field label="Hero Title">
            <Input {...register("about_hero_title")} disabled={!canEdit} />
          </Field>
          <Field label="Hero Description">
            <Textarea {...register("about_hero_description")} rows={3} disabled={!canEdit} />
          </Field>
          <Field label="Hero Image">
            <Controller
              control={control}
              name="about_hero_image"
              render={({ field }) => (
                <ImageUpload value={field.value ?? undefined} onChange={field.onChange} folder="nupun/about" aspect="wide" />
              )}
            />
          </Field>
          
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Hero Stats (The floating band)</h3>
              {canEdit && (
                <Button type="button" variant="outline" size="sm" onClick={() => statsField.append({ value: "", label: "" })}>
                  <Plus className="h-4 w-4" /> Add Stat
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {statsField.fields.map((f, i) => (
                <div key={f.id} className="flex gap-3 items-end">
                  <div className="w-1/3 space-y-1.5">
                    <Label className="text-xs">Value (e.g. 35+)</Label>
                    <Input {...register(`about_stats.${i}.value` as const)} disabled={!canEdit} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Label (e.g. Years of Trust)</Label>
                    <Input {...register(`about_stats.${i}.label` as const)} disabled={!canEdit} />
                  </div>
                  {canEdit && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => statsField.remove(i)}>
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

const ICON_OPTIONS = [
  { value: "heart-pulse", label: "Heart Pulse" },
  { value: "icu", label: "ICU" },
  { value: "shield-check", label: "Shield Check" },
  { value: "clock", label: "Clock / 24×7" },
];

function HomeAboutForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<WebsiteSettings>();
  const featuresField = useFieldArray({ control, name: "home_about_features" });
  const tilesField = useFieldArray({ control, name: "home_about_tiles" });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) => settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("Home About section saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({
      home_about_heading: v.home_about_heading,
      home_about_description: v.home_about_description,
      home_about_features: v.home_about_features,
      home_about_tiles: v.home_about_tiles,
    }))}>
      <Card>
        <CardHeader>
          <CardTitle>Home Page — About Us Section</CardTitle>
          <CardDescription>
            Manage the heading, description, 3 feature highlights, and 4 image cards shown in the About section on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* ── Heading & Description ── */}
          <div className="space-y-4">
            <Field label="Section Heading">
              <Input
                {...register("home_about_heading")}
                placeholder="Professionals dedicated to your health"
                disabled={!canEdit}
              />
            </Field>
            <Field label="Section Description">
              <Textarea
                {...register("home_about_description")}
                rows={3}
                placeholder="Nupun Home Health Care provides a qualified team of nursing staff..."
                disabled={!canEdit}
              />
            </Field>
          </div>

          {/* ── Features (3 items) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Feature Highlights (left side)</Label>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => featuresField.append({ title: "", description: "", icon: "heart-pulse", icon_image: null })}
                >
                  <Plus className="h-4 w-4" /> Add Feature
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {featuresField.fields.map((f, i) => (
                <div key={f.id} className="p-4 border rounded-lg bg-muted/10 space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-32 shrink-0 space-y-1.5">
                      <Label className="text-xs">Icon Image (PNG)</Label>
                      <Controller
                        control={control}
                        name={`home_about_features.${i}.icon_image` as const}
                        render={({ field }) => (
                          <ImageUpload
                            value={field.value ? (typeof field.value === 'string' ? { url: field.value, public_id: '' } : field.value) : undefined}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3 items-end">
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-xs">Title</Label>
                          <Input {...register(`home_about_features.${i}.title` as const)} disabled={!canEdit} />
                        </div>
                        <div className="w-36 space-y-1.5">
                          <Label className="text-xs">Fallback Icon</Label>
                          <Controller
                            control={control}
                            name={`home_about_features.${i}.icon` as const}
                            render={({ field }) => (
                              <select
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                value={field.value || "heart-pulse"}
                                onChange={field.onChange}
                                disabled={!canEdit}
                              >
                                {ICON_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                        {canEdit && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => featuresField.remove(i)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          {...register(`home_about_features.${i}.description` as const)}
                          rows={2}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* ── Image Tiles (4 cards) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Image Cards (right side — 2×2 grid)</Label>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    tilesField.append({
                      image: null,
                      count: "",
                      title: "",
                      description: "",
                      cta_label: "",
                      cta_link: "/booking",
                    })
                  }
                >
                  <Plus className="h-4 w-4" /> Add Tile
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {tilesField.fields.map((f, i) => (
                <div key={f.id} className="p-4 border rounded-lg bg-muted/10 space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-48 shrink-0 space-y-1.5">
                      <Label className="text-xs">Image</Label>
                      <Controller
                        control={control}
                        name={`home_about_tiles.${i}.image` as const}
                        render={({ field }) => (
                          <ImageUpload
                            value={field.value ? (typeof field.value === 'string' ? { url: field.value, public_id: '' } : field.value) : undefined}
                            onChange={field.onChange}
                            folder="nupun/home-about"
                            aspect="square"
                          />
                        )}
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Count (e.g. 120+)</Label>
                          <Input {...register(`home_about_tiles.${i}.count` as const)} disabled={!canEdit} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Title</Label>
                          <Input {...register(`home_about_tiles.${i}.title` as const)} disabled={!canEdit} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Input {...register(`home_about_tiles.${i}.description` as const)} disabled={!canEdit} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">CTA Label</Label>
                          <Input {...register(`home_about_tiles.${i}.cta_label` as const)} disabled={!canEdit} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">CTA Link</Label>
                          <Input {...register(`home_about_tiles.${i}.cta_link` as const)} disabled={!canEdit} />
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => tilesField.remove(i)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
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

function ContentSectionsForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset, control } = useForm<WebsiteSettings>();
  const whyChooseField = useFieldArray({ control, name: "why_choose_items" });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) => settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("Content sections saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <Card>
        <CardHeader>
          <CardTitle>Content Sections</CardTitle>
          <CardDescription>Manage shared sections like 'Why Choose Us' and 'Conditions We Support'.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Why Choose Nupun (Services Page)</Label>
              {canEdit && (
                <Button type="button" variant="outline" size="sm" onClick={() => whyChooseField.append({ title: "", detail: "" })}>
                  <Plus className="h-4 w-4" /> Add Reason
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {whyChooseField.fields.map((f, i) => (
                <div key={f.id} className="flex gap-3 items-end p-3 border rounded-lg bg-muted/10">
                  <div className="w-1/3 space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input {...register(`why_choose_items.${i}.title` as const)} disabled={!canEdit} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Detail / Description</Label>
                    <Input {...register(`why_choose_items.${i}.detail` as const)} disabled={!canEdit} />
                  </div>
                  {canEdit && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => whyChooseField.remove(i)}>
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

function LegalAndFooterForm({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "website"],
    queryFn: () => settingsService.getWebsite(),
  });

  const { register, handleSubmit, reset } = useForm<WebsiteSettings>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Partial<WebsiteSettings>) => settingsService.updateWebsite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "website"] });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <Card>
        <CardHeader>
          <CardTitle>Footer & CTA</CardTitle>
          <CardDescription>Manage footer text and call to action content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field label="Footer Tagline">
            <Input {...register("footer_tagline")} disabled={!canEdit} />
          </Field>
          <Field label="Footer Description">
            <Textarea {...register("footer_description")} rows={3} disabled={!canEdit} />
          </Field>
          <Field label="CTA Title">
            <Input {...register("cta_title")} disabled={!canEdit} />
          </Field>
          <Field label="CTA Description">
            <Textarea {...register("cta_description")} rows={2} disabled={!canEdit} />
          </Field>
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
