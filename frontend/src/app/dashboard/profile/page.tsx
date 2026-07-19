"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, Shield, BookOpen, Loader2, Edit2, Phone, Save, X, Camera, Upload } from "lucide-react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  phone_number?: string;
  profile_photo_url?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    full_name: "",
    phone_number: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data);
      setEditForm({
        email: data.email || "",
        full_name: data.full_name || "",
        phone_number: data.phone_number || ""
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: editForm.email || null,
          full_name: editForm.full_name || null,
          phone_number: editForm.phone_number || null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update profile");
      }
      
      const updatedData = await res.json();
      setProfile(updatedData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Triggered when a user selects a file
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
      // Reset input so they can pick the same file again if they cancel
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setUploadingImage(true);
    setError("");

    try {
      // Extract the cropped portion as a Blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");

      const res = await fetch("http://localhost:8000/api/v1/auth/me/photo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to upload photo");
      }

      const updatedData = await res.json();
      setProfile(updatedData);
      setImageSrc(null); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-destructive text-center max-w-md w-full shadow-sm">
          <p className="font-semibold">{error || "Failed to load profile"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[80vh] max-w-5xl relative">
      
      {/* Cropping Modal Overlay */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden flex flex-col h-[80vh] md:h-[600px]">
            <div className="p-4 border-b flex justify-between items-center bg-secondary/20">
              <h3 className="font-bold">Crop Profile Photo</h3>
              <button onClick={() => setImageSrc(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative flex-1 bg-black/10">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  onClick={() => setImageSrc(null)}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={uploadCroppedImage}
                  disabled={uploadingImage}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Student Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your progress.
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col items-center p-8 border rounded-2xl shadow-sm bg-card text-center relative overflow-hidden group">
            
            <div className="relative z-10 mb-4">
              {profile?.profile_photo_url ? (
                <img 
                  src={profile.profile_photo_url} 
                  alt="Profile" 
                  className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-md"
                  onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/png?text=Invalid+Image';
                  }}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-md">
                  <UserIcon className="h-16 w-16 text-primary" />
                </div>
              )}

              {/* Upload Pencil Overlay */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-50"
                title="Change Profile Photo"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground z-10">
              {profile?.full_name || "NEET Aspirant"}
            </h2>
            <div className="mt-2 flex flex-col items-center space-y-2 text-sm text-muted-foreground z-10">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                {profile?.email}
              </div>
              {profile?.phone_number && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  {profile.phone_number}
                </div>
              )}
            </div>
            
            {profile?.is_superuser && (
              <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary z-10">
                <Shield className="h-3 w-3 mr-1.5" />
                Administrator
              </div>
            )}

            {/* Decorative background blob */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>

        {/* Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {isEditing && (
            <div className="border rounded-2xl shadow-sm bg-card overflow-hidden ring-2 ring-primary/20">
              <div className="p-6 bg-primary/5 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center">
                  <Edit2 className="h-5 w-5 mr-2 text-primary" />
                  Edit Information
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input 
                      type="text"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. Dr. Student"
                      value={editForm.full_name}
                      onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input 
                      type="email"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="doctor@example.com"
                      value={editForm.email}
                      onChange={e => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input 
                      type="text"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="+91 9876543210"
                      value={editForm.phone_number}
                      onChange={e => setEditForm({...editForm, phone_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
              <div className="p-6 bg-primary/5 border-b">
                <h3 className="text-lg font-bold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Study Statistics
                </h3>
              </div>
              <div className="p-6 text-center text-muted-foreground italic text-sm">
                Analytics tracking will be available in the next phase! You'll be able to see topics completed and test readiness here.
              </div>
            </div>
          )}

          <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
            <div className="p-6 bg-secondary/30 border-b">
              <h3 className="text-lg font-bold">Account Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <Link href="/login?reset=true" className="flex items-center justify-between p-4 border rounded-xl hover:border-primary/50 transition-colors group">
                <div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">Change Password</div>
                  <div className="text-sm text-muted-foreground mt-1">Update your login credentials securely</div>
                </div>
                <div className="text-primary font-medium">&rarr;</div>
              </Link>
              <Link href="/delete-account" className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-xl hover:border-destructive/50 transition-colors group">
                <div>
                  <div className="font-semibold text-destructive group-hover:text-destructive/80 transition-colors">Delete Account</div>
                  <div className="text-sm text-destructive/70 mt-1">Permanently remove your account and data</div>
                </div>
                <div className="text-destructive font-medium">&rarr;</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
