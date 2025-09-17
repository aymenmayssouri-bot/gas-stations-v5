// src/app/(authenticated)/admin/database/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProvinces } from '@/hooks/ReferenceData/useProvinces';
import { useCommunes } from '@/hooks/ReferenceData/useCommunes';
import { useMarques } from '@/hooks/ReferenceData/useMarques';
import { useProvinceCRUD } from '@/hooks/ReferenceData/useProvinceCRUD';
import { useCommuneCRUD } from '@/hooks/ReferenceData/useCommuneCRUD';
import { useMarqueCRUD } from '@/hooks/ReferenceData/useMarqueCRUD';
import { Province, Commune, Marque } from '@/types/station';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/Button'; // Assuming this is your custom Button; if shadcn, it's '@/components/ui/button'
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProvincesPanel = () => {
  const { provinces, loading: fetchLoading, refetch } = useProvinces();
  const { createProvince, updateProvince, deleteProvince, loading: crudLoading, error } = useProvinceCRUD();
  const [open, setOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [nomProvince, setNomProvince] = useState('');

  const handleOpen = (province: Province | null = null) => {
    setEditingProvince(province);
    setNomProvince(province?.NomProvince || '');
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomProvince.trim()) {
      alert('Please provide a province name.');
      return;
    }
    try {
      if (editingProvince) {
        await updateProvince(editingProvince.ProvinceID, { NomProvince: nomProvince });
      } else {
        await createProvince({ NomProvince: nomProvince });
      }
      refetch();
      setOpen(false);
      setNomProvince('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProvince(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (fetchLoading) return <p>Loading provinces...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Provinces</h2>
        <Button variant="default" onClick={() => handleOpen()}>Create New Province</Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {provinces.map((p) => (
            <TableRow key={p.ProvinceID}>
              <TableCell>{p.NomProvince}</TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="outline" onClick={() => handleOpen(p)}>Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure you want to delete this province?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p.ProvinceID)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProvince ? 'Edit Province' : 'Create Province'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nomProvince">Province Name</Label>
              <Input
                id="nomProvince"
                value={nomProvince}
                onChange={(e) => setNomProvince(e.target.value)}
                placeholder="Enter province name"
              />
            </div>
            <Button type="submit" disabled={crudLoading || !nomProvince.trim()}>
              {crudLoading ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CommunesPanel = () => {
  const { provinces, loading: provincesLoading } = useProvinces();
  const { communes, loading: fetchLoading, refetch } = useCommunes();
  const { createCommune, updateCommune, deleteCommune, loading: crudLoading, error } = useCommuneCRUD();
  const [open, setOpen] = useState(false);
  const [editingCommune, setEditingCommune] = useState<Commune | null>(null);
  const [nomCommune, setNomCommune] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('');

  // Add useEffect to set initial province
  useEffect(() => {
    if (provinces.length > 0 && !selectedProvinceFilter) {
      setSelectedProvinceFilter(provinces[0].ProvinceID);
    }
  }, [provinces]);

  // Filter communes based on selected province
  const filteredCommunes = useMemo(() => {
    if (!selectedProvinceFilter) return communes;
    return communes.filter(commune => commune.ProvinceID === selectedProvinceFilter);
  }, [communes, selectedProvinceFilter]);

  const handleOpen = (commune: Commune | null = null) => {
    setEditingCommune(commune);
    setNomCommune(commune?.NomCommune || '');
    setProvinceId(commune?.ProvinceID || '');
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCommune.trim() || !provinceId) {
      alert('Please provide a commune name and select a province.');
      return;
    }
    try {
      if (editingCommune) {
        await updateCommune(editingCommune.CommuneID, { NomCommune: nomCommune, ProvinceID: provinceId });
      } else {
        await createCommune({ NomCommune: nomCommune, ProvinceID: provinceId });
      }
      refetch();
      setOpen(false);
      setNomCommune('');
      setProvinceId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCommune(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (fetchLoading || provincesLoading) return <p>Loading communes...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Communes</h2>
        <div className="flex items-center gap-4">
          {/* Add Province Filter Dropdown */}
          <div className="w-64">
            <Select value={selectedProvinceFilter} onValueChange={setSelectedProvinceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p.ProvinceID} value={p.ProvinceID}>
                    {p.NomProvince}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="default" onClick={() => handleOpen()}>Create New Commune</Button>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Use filteredCommunes instead of communes */}
          {filteredCommunes.map((c) => (
            <TableRow key={c.CommuneID}>
              <TableCell>{c.NomCommune}</TableCell>
              <TableCell>{provinces.find((p) => p.ProvinceID === c.ProvinceID)?.NomProvince || 'Unknown'}</TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="outline" onClick={() => handleOpen(c)}>Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure you want to delete this commune?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(c.CommuneID)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCommune ? 'Edit Commune' : 'Create Commune'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nomCommune">Commune Name</Label>
              <Input
                id="nomCommune"
                value={nomCommune}
                onChange={(e) => setNomCommune(e.target.value)}
                placeholder="Enter commune name"
              />
            </div>
            <div>
              <Label>Province</Label>
              <Select value={provinceId} onValueChange={setProvinceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.ProvinceID} value={p.ProvinceID}>
                      {p.NomProvince}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={crudLoading || !nomCommune.trim() || !provinceId}>
              {crudLoading ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MarquesPanel = () => {
  const { marques, loading: fetchLoading, refetch } = useMarques();
  const { createMarque, updateMarque, deleteMarque, loading: crudLoading, error } = useMarqueCRUD();
  const [open, setOpen] = useState(false);
  const [editingMarque, setEditingMarque] = useState<Marque | null>(null);
  const [marqueName, setMarqueName] = useState('');
  const [raisonSociale, setRaisonSociale] = useState('');

  const handleOpen = (marque: Marque | null = null) => {
    setEditingMarque(marque);
    setMarqueName(marque?.Marque || '');
    setRaisonSociale(marque?.RaisonSociale || '');
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marqueName.trim() || !raisonSociale.trim()) {
      alert('Please provide both marque name and raison sociale.');
      return;
    }
    try {
      if (editingMarque) {
        await updateMarque(editingMarque.MarqueID, { Marque: marqueName, RaisonSociale: raisonSociale });
      } else {
        await createMarque({ Marque: marqueName, RaisonSociale: raisonSociale });
      }
      refetch();
      setOpen(false);
      setMarqueName('');
      setRaisonSociale('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMarque(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (fetchLoading) return <p>Loading marques...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Marques</h2>
        <Button variant="default" onClick={() => handleOpen()}>Create New Marque</Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marque</TableHead>
            <TableHead>Raison Sociale</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marques.map((m) => (
            <TableRow key={m.MarqueID}>
              <TableCell>{m.Marque}</TableCell>
              <TableCell>{m.RaisonSociale}</TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="outline" onClick={() => handleOpen(m)}>Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure you want to delete this marque?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(m.MarqueID)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMarque ? 'Edit Marque' : 'Create Marque'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="marqueName">Marque Name</Label>
              <Input
                id="marqueName"
                value={marqueName}
                onChange={(e) => setMarqueName(e.target.value)}
                placeholder="Enter marque name"
              />
            </div>
            <div>
              <Label htmlFor="raisonSociale">Raison Sociale</Label>
              <Input
                id="raisonSociale"
                value={raisonSociale}
                onChange={(e) => setRaisonSociale(e.target.value)}
                placeholder="Enter raison sociale"
              />
            </div>
            <Button type="submit" disabled={crudLoading || !marqueName.trim() || !raisonSociale.trim()}>
              {crudLoading ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function DatabaseAdminPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Database Management</h1>
      <Tabs defaultValue="provinces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="provinces">Provinces</TabsTrigger>
          <TabsTrigger value="communes">Communes</TabsTrigger>
          <TabsTrigger value="marques">Marques</TabsTrigger>
        </TabsList>
        <TabsContent value="provinces">
          <ProvincesPanel />
        </TabsContent>
        <TabsContent value="communes">
          <CommunesPanel />
        </TabsContent>
        <TabsContent value="marques">
          <MarquesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}