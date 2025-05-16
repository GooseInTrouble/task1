'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LogoutIcon from '@mui/icons-material/Logout';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserAndPhotos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchPhotos(session.user.id);
      }
    };

    fetchUserAndPhotos();
  }, []);

  const fetchPhotos = async (userId: string) => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `user-${user.id}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (!uploadError) {
        await supabase.from('photos').insert({
          user_id: user.id,
          path: filePath,
        });
      }
    }

    setUploading(false);
    setOpen(false);
    fetchPhotos(user.id);
  };

  const getImageUrl = (path: string) => {
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  };

  return (
    <Box>
      {/* AppBar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="#1976d2" color="white">
        <Typography variant="h6">MyApp</Typography>
        <Box>
          <Button color="inherit" href="/">Головна</Button>
          <IconButton onClick={handleLogout} color="inherit" title="Вийти">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Додати фото */}
      <Box p={2}>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => setOpen(true)}
        >
          Додати фото
        </Button>
      </Box>

      {/* Grid фото */}
      <Box p={2}>
        {photos.length > 0 ? (
          <ImageList cols={3} gap={12}>
            {photos.map((photo) => (
              <ImageListItem key={photo.id}>
                <img
                  src={getImageUrl(photo.path)}
                  alt="user photo"
                  loading="lazy"
                  style={{ borderRadius: 8 }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography>У вас ще немає фото.</Typography>
        )}
      </Box>

      {/* Модалка */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Завантажити фото</DialogTitle>
        <DialogContent>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Скасувати</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
