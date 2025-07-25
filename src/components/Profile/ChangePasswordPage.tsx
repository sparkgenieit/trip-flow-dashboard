// src/components/Profile/ChangePasswordPage.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {changePassword} from '@/services/profile';

const ChangePasswordPage = () => {
    const { toast } = useToast();
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (form.newPassword !== form.confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please confirm your new password correctly.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });


            toast({
                title: 'Password Changed',
                description: 'Your password has been successfully updated.',
            });

            setForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err: any) {
            toast({
                title: 'Change Failed',
                description: err?.response?.data?.message || 'Something went wrong.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 mt-4 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Change Password</h1>

            <div className="space-y-4">
                <Input
                    type="password"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={form.currentPassword}
                    onChange={handleChange}
                />
                <Input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={handleChange}
                />
                <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-4 mt-6">
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : 'Change Password'}
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
