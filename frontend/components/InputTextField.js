import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from '../styles/Accueil.module.css';

export default function InputTextField(props) {
  return (
    <Box

      component="form"
      sx={{
        width: '100%',
      }}
      noValidate
      autoComplete="off"
      autoFocus={true}
    >
      <TextField
        classes={styles.inputSunoLink}
        id="outlined-basic"
        label="Paste your Suno link..."
        variant="outlined"
        sx={{
          '& .MuiInputBase-input': { color: 'white' }, // Pour le texte de l'input
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'black', // Couleur de fond de l'input
            '& fieldset': { borderColor: 'white' }, // Bordure blanche
            '&:hover fieldset': { borderColor: 'gray' }, // Bordure grise au survol
            '&.Mui-focused fieldset': { borderColor: '#B300F2' }, // Bordure bleue au focus
            //Placeholder text color
            '& .MuiFormLabel-root': { color: 'white' },
            //input label color
            '& .MuiInputLabel-root ': {
              color: 'white'
            },
            //input placeholder color when focused
            '&.Mui-focused fieldset::placeholder': {
              color: 'red'
            }
          }
        }
        }
      />
    </Box>
  );
}
