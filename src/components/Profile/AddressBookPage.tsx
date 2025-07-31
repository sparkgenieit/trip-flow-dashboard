import React, { useEffect, useState } from 'react';
import { getAddressBook, updateAddressBook } from '@/services/addressBook';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const AddressBookPage = () => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<any>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    pinCode: '',
    type: 'PICKUP',
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getAddressBook();
        setAddresses(data);
      } catch (err: any) {
        toast({
          title: 'Failed to load addresses',
          description: err?.response?.data?.message || 'Try again later.',
          variant: 'destructive',
        });
      }
    };
    fetchAddresses();
  }, [toast]);

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setFormState({
      ...formState,
      [addr.id]: {
        address: addr.address || '',
        city: addr.city || '',
        pinCode: addr.pinCode || '',
        type: addr.type || '',
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    setFormState({
      ...formState,
      [id]: {
        ...formState[id],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSave = async (id: number) => {
    try {
      await updateAddressBook({ id, ...formState[id] });
      toast({ title: 'Updated', description: 'Address updated.' });
      setEditingId(null);

      const updated = await getAddressBook();
      setAddresses(updated);
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.response?.data?.message || 'Update error.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/address-book/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      toast({ title: 'Deleted', description: 'Address removed.' });
      setAddresses(addresses.filter((addr) => addr.id !== id));
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err?.response?.data?.message || 'Could not delete address.',
        variant: 'destructive',
      });
    }
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewSubmit = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/address-book`, newAddress, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    toast({ title: 'Address Added', description: 'New address saved.' });
    setNewAddress({ address: '', city: '', pinCode: '', type: 'PICKUP' });
    setShowNewForm(false);

    const updated = await getAddressBook();
    setAddresses(updated);
  } catch (err: any) {
    toast({
      title: 'Add Failed',
      description: err?.response?.data?.message || 'Could not save.',
      variant: 'destructive',
    });
  }
};


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        {!showNewForm && <Button onClick={() => setShowNewForm(true)}>Add</Button>}
      </div>

      {showNewForm ? (
        <div className="bg-white shadow-md rounded-md p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
          <div className="space-y-4">
            <Input
              name="address"
              placeholder="Address"
              value={newAddress.address}
              onChange={handleNewChange}
            />
            <Input
              name="city"
              placeholder="City"
              value={newAddress.city}
              onChange={handleNewChange}
            />
            <Input
              name="pinCode"
              placeholder="Pincode"
              value={newAddress.pinCode}
              onChange={handleNewChange}
            />
            <select
              name="type"
              value={newAddress.type}
              onChange={handleNewChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="PICKUP">Pickup</option>
              <option value="DROP">Drop</option>
              <option value="HOME">Home</option>
              <option value="OFFICE">Office</option>
              <option value="OTHER">Other</option>
            </select>

            <div className="flex gap-3 mt-4">
              <Button onClick={handleNewSubmit}>Save</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="bg-white shadow p-4 rounded border">
              <h2 className="font-semibold text-lg mb-2">{addr.type} Address</h2>
              {editingId === addr.id ? (
                <>
                  <Input
                    name="address"
                    placeholder="Address"
                    value={formState[addr.id]?.address || ''}
                    onChange={(e) => handleChange(e, addr.id)}
                  />
                  <Input
                    name="city"
                    placeholder="City"
                    value={formState[addr.id]?.city || ''}
                    onChange={(e) => handleChange(e, addr.id)}
                  />
                  <Input
                    name="pinCode"
                    placeholder="Pincode"
                    value={formState[addr.id]?.pinCode || ''}
                    onChange={(e) => handleChange(e, addr.id)}
                  />

                  <select
                    name="type"
                    value={formState[addr.id]?.type || ''}
                    onChange={(e) => handleChange(e, addr.id)}
                    className="border rounded px-3 py-2 w-full mt-2"
                  >
                    <option value="PICKUP">Pickup</option>
                    <option value="DROP">Drop</option>
                    <option value="HOME">Home</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>

                  <div className="flex gap-3 mt-3">
                    <Button onClick={() => handleSave(addr.id)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>

                </>
              ) : (
                <>
                  <p><strong>Address:</strong> {addr.address || '-'}</p>
                  <p><strong>City:</strong> {addr.city || '-'}</p>
                  <p><strong>Pincode:</strong> {addr.pinCode || '-'}</p>
                  <p><strong>Type:</strong> {addr.type}</p>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => handleEdit(addr)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDelete(addr.id)}>Delete</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBookPage;
