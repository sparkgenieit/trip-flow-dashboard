import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getProfile, updateProfile } from '@/services/profile';

const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
        });
      } catch (err: any) {
        console.error('Failed to fetch profile', err);
        toast({
          title: 'Failed to Load',
          description: err?.response?.data?.message || 'Could not load profile.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        age: Number(form.age),
        gender: form.gender,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });

      setIsEditing(false); // ✅ return to view mode
    } catch (err: any) {
      console.error('Failed to update profile', err);
      toast({
        title: 'Update Failed',
        description: err?.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 mt-4 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {!isEditing ? (
        <div className="space-y-3">
          <div><strong>Name:</strong> {form.name}</div>
          <div><strong>Email:</strong> {form.email}</div>
          <div><strong>Phone:</strong> {form.phone || '-'}</div>
          <div><strong>Age:</strong> {form.age || '-'}</div>
          <div><strong>Gender:</strong> {form.gender || '-'}</div>

          <div className="mt-6">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={form.email} readOnly />
            <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <Input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
            <Input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
          </div>

          <div className="flex gap-4 mt-6">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
