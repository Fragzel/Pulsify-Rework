import * as React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField, Box } from '@mui/material';

export default function AutocompleteIntroduction({ genresList }) {
  const [inputValue, setInputValue] = React.useState('');
  const options = genresList.map((genre) => ({ label: genre.genre }));

  return (
    <Box
      sx={{
        width: '60%',
        maxWidth: '55vw',
        maxHeight: '35px',
        backgroundColor: '#797391',
        height: '43',
        border: '1px solid #000000',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.15)',
        borderRadius: '7px',
        margin: '10px',
        marginTop: '-10px',
        // padding: '8px',
      }}
    >
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        value={inputValue ? { label: inputValue } : null}
        onChange={(event, newValue) => {
          setInputValue(newValue ? newValue.label : '');
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Choisissez un genre"
            variant="outlined" // Choix parmi 'standard', 'filled', 'outlined'
            sx={{
              height: '5vh',
              width: '100%',
              '& .MuiOutlinedInput-root': {
                color: 'rgb(255, 255, 255)',
                backgroundColor: '#797391',
                '& fieldset': {
                  borderColor: '#000000',
                  borderWidth: 0,
                  height: '100%',
                },
                '&:hover fieldset': {
                  borderColor: '#ffffff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputBase-input': {
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '10px 12px',
                height: '100%',
                // marginBottom: "-20px",
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1,
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 1)',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
        )}
        disableClearable={false}
      />
    </Box>
  );
}

AutocompleteIntroduction.propTypes = {
  genresList: PropTypes.arrayOf(
    PropTypes.shape({
      genre: PropTypes.string.isRequired,
    })
  ).isRequired,
};
