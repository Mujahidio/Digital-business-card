"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Mail, MapPin, Phone, Globe, Linkedin, Twitter, Github, Palette, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge, Card, CardContent } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUploadDialog } from "@/components/image-upload-dialog"
import { ThemeSelector, themes, type Theme } from "@/components/theme-selector"
import { ThemedBusinessCard } from "@/components/themed-business-card"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { DataManagement } from "@/components/data-management"
import { URLSharingDialog } from "@/components/url-sharing-dialog"
import { SharedProfileBanner } from "@/components/shared-profile-banner"
import { getSharedDataFromURL, hasSharedData, clearSharedDataFromURL, type ShareableProfile } from "@/utils/url-sharing"

export function BusinessCard() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false)

  const [isURLSharingOpen, setIsURLSharingOpen] = useState(false)
  const [isViewingShared, setIsViewingShared] = useState(false)
  const [sharedData, setSharedData] = useState<{ profile: ShareableProfile; theme: Theme } | null>(null)

  // Use localStorage for theme and profile data
  const [currentTheme, setCurrentTheme, isThemeLoading] = useLocalStorage<Theme>("businessCard_theme", themes[0])
  const [editedProfile, setEditedProfile, isProfileLoading] = useLocalStorage("businessCard_profile", {
    name: "Mujahid Ahmed",
    title: "AI & Data Science Specialist",
    company: "IAU Inc.",
    email: "mujaheda2003@gmail.com",
    phone: "+905312588595",
    location: "Turkey, Ist",
    website: "mujahidahmed.design",
    bio: "Leveraging data science to build intelligent, user-centered solutions that prioritize accessibility, insights, and innovation.",
    avatar: "/placeholder.svg?height=400&width=400",
    skills: ["Python", "Deep learning and neural networks", "Matplotlib / Seaborn / Plotly", "Hadoop / Spark"],
    social: {
      linkedin: "linkedin.com/in/mujahid-ahmed-7630b1290",
      twitter: "x.com/MujahedAhmed14",
      github: "github.com/Mujahidio",
    },
  })

  const isLoading = isThemeLoading || isProfileLoading

  // Check for shared profile data in URL
  useEffect(() => {
    if (hasSharedData()) {
      const shared = getSharedDataFromURL()
      if (shared) {
        setSharedData({ profile: shared.profile, theme: shared.theme })
        setIsViewingShared(true)
        setCurrentTheme(shared.theme)
      }
    }
  }, [])

  const handleDataCleared = () => {
    // Reset to default values
    setCurrentTheme(themes[0])
    setEditedProfile({
      name: "Mujahid Ahmed",
      title: "AI & Data Science Specialist",
      company: "IAU Inc.",
      email: "mujaheda2003@gmail.com",
      phone: "+905312588595",
      location: "Turkey, Ist",
      website: "mujahidahmed.design",
      bio: "Leveraging data science to build intelligent, user-centered solutions that prioritize accessibility, insights, and innovation.",
      avatar: "/placeholder.svg?height=400&width=400",
      skills: ["Python", "Deep learning and neural networks", "Matplotlib / Seaborn / Plotly", "Hadoop / Spark"],
      social: {
        linkedin: "linkedin.com/in/mujahid-ahmed-7630b1290",
        twitter: "x.com/MujahedAhmed14",
        github: "github.com/Mujahidio",
      },
    })
  }

  const handleViewOwnProfile = () => {
    setIsViewingShared(false)
    setSharedData(null)
    clearSharedDataFromURL()
  }

  const handleDismissSharedBanner = () => {
    clearSharedDataFromURL()
    setIsViewingShared(false)
    setSharedData(null)
  }

  const profile = isViewingShared && sharedData ? sharedData.profile : editedProfile
  const { toast } = useToast()

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your business card has been saved and will be remembered",
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSocialChange = (platform: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value,
      },
    }))
  }

  const handleSkillsChange = (skillsString: string) => {
    const skillsArray = skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
    setEditedProfile((prev) => ({
      ...prev,
      skills: skillsArray,
    }))
  }

  const handleCopyContact = () => {
    const contactInfo = `
Name: ${profile.name}
Title: ${profile.title}
Company: ${profile.company}
Email: ${profile.email}
Phone: ${profile.phone}
Website: ${profile.website}
Location: ${profile.location}
    `

    navigator.clipboard.writeText(contactInfo.trim())
    toast({
      title: "Contact copied",
      description: "Contact information copied to clipboard",
    })
  }

  const handleShare = async () => {
    // First try URL sharing dialog
    setIsURLSharingOpen(true)
  }

  const handleDownloadVCard = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.title}
ORG:${profile.company}
EMAIL:${profile.email}
TEL:${profile.phone}
URL:${profile.website}
ADR:;;${profile.location};;;
NOTE:${profile.bio}
END:VCARD`

    const blob = new Blob([vCard], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `${profile.name.replace(/\s+/g, "_")}.vcf`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Contact downloaded",
      description: "Contact saved as vCard file",
    })
  }

  const handleCroppedImage = (croppedImageUrl: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      avatar: croppedImageUrl,
    }))
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been successfully updated",
    })
  }

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    toast({
      title: "Theme updated",
      description: `Switched to ${theme.name} theme and saved your preference`,
    })
  }

  const getBadgeStyle = () => {
    switch (currentTheme.layout) {
      case "creative":
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200"
      case "dark":
        return "bg-gray-800 text-emerald-400 border-gray-700"
      case "classic":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-2">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your business card...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={currentTheme.colors.background}>
      <div className="flex justify-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setIsThemeSelectorOpen(true)} className="gap-2">
          <Palette className="h-4 w-4" />
          Change Theme
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsDataManagementOpen(true)} className="gap-2">
          <Download className="h-4 w-4" />
          Data
        </Button>
      </div>

      {isViewingShared && sharedData && (
        <SharedProfileBanner
          sharedProfileName={sharedData.profile.name}
          onViewOwn={handleViewOwnProfile}
          onDismiss={handleDismissSharedBanner}
        />
      )}

      <ThemedBusinessCard
        theme={currentTheme}
        profile={profile}
        isEditing={isEditing}
        onEdit={isViewingShared ? () => {} : handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onCopyContact={handleCopyContact}
        onShare={handleShare}
        onDownloadVCard={handleDownloadVCard}
        onUploadImage={() => setIsUploadDialogOpen(true)}
      >
        <div className="space-y-1.5 mb-4">
          {isEditing && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={profile.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter your job title"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-3 mb-4 ${currentTheme.layout === "dark" ? "bg-gray-800" : ""}`}>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Enter your bio"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Textarea
                    id="skills"
                    value={profile.skills.join(", ")}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="Enter your skills separated by commas"
                    rows={2}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Social Media</Label>
                  <div>
                    <Label htmlFor="linkedin" className="text-sm">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={profile.social.linkedin}
                      onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm">
                      Twitter/X
                    </Label>
                    <Input
                      id="twitter"
                      value={profile.social.twitter}
                      onChange={(e) => handleSocialChange("twitter", e.target.value)}
                      placeholder="x.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-sm">
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={profile.social.github}
                      onChange={(e) => handleSocialChange("github", e.target.value)}
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className={`text-sm ${currentTheme.colors.muted}`}>{profile.bio}</p>

                <div>
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} className={getBadgeStyle()}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Connect</h3>
                  <div className="flex space-x-2">
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={`https://${profile.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={`https://${profile.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={`https://${profile.social.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="Enter your website"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className={`h-4 w-4 mr-2 ${currentTheme.colors.muted}`} />
                  <a href={`mailto:${profile.email}`} className="text-sm hover:underline">
                    {profile.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className={`h-4 w-4 mr-2 ${currentTheme.colors.muted}`} />
                  <a href={`tel:${profile.phone}`} className="text-sm hover:underline">
                    {profile.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <Globe className={`h-4 w-4 mr-2 ${currentTheme.colors.muted}`} />
                  <a
                    href={`https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
                <div className="flex items-center">
                  <MapPin className={`h-4 w-4 mr-2 ${currentTheme.colors.muted}`} />
                  <span className="text-sm">{profile.location}</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qrcode" className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={window.location.href}
                size={200}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: profile.avatar,
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <p className={`text-xs text-center ${currentTheme.colors.muted}`}>
              Scan to view this digital business card
            </p>
          </TabsContent>
        </Tabs>
      </ThemedBusinessCard>

      <ThemeSelector
        open={isThemeSelectorOpen}
        onOpenChange={setIsThemeSelectorOpen}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      <ImageUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onImageCropped={handleCroppedImage}
      />

      <DataManagement
        open={isDataManagementOpen}
        onOpenChange={setIsDataManagementOpen}
        onDataCleared={handleDataCleared}
      />

      <URLSharingDialog
        open={isURLSharingOpen}
        onOpenChange={setIsURLSharingOpen}
        profile={editedProfile}
        theme={currentTheme}
      />
    </div>
  )
}
