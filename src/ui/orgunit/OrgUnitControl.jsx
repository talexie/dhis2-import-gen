import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material';
import { LocationTree } from '../dhis2OuTree';
import { css } from '@emotion/react';
import uniqBy from 'lodash/uniqBy';
import { useUserOrganisationUnits } from './OrgUnitTree';

const card = css({
  margin: '16px',
  minWidth: '400px',
  float: 'left'
});

/**
 * Customized Tree View
 * @param {*} props 
 * @example
 * {
 *    options:{
 *        maxLevel:3,
 *        minLevel:2,
 *        level:1,
 *        accessLevel:"DATAENTRY" or "DATAVIEW",
 *        multiSelect: true or false,
 *        search: true or false
 *    }
 * }
 */

export const OrgUnitControl = (props) => {
  const { 
    open, 
    handleClose, 
    selectionLevel,
    enableSelectionLevel=false,
    multiselect = false, 
    onChange, 
    getSelected, 
    onBlur=()=>{} 
  } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [selected, setSelected] = useState([]);
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const [selectedItem, setSelectedItem] = useState([]); 
  const { loading, organisationUnits:roots, error } = useUserOrganisationUnits();
  const [expanded, setExpanded] = useState([]);

    const handleExpand = useCallback(
        ({ path }) => {
            if (!expanded.includes(path)) {
                setExpanded([...expanded, path])
            }
        },
        [expanded, setExpanded]
    )

    const handleCollapse = useCallback(
        ({ path }) => {
            const pathIndex = expanded.indexOf(path)

            if (pathIndex !== -1) {
                const updatedExpanded =
                    pathIndex === 0
                        ? expanded.slice(1)
                        : [
                            ...expanded.slice(0, pathIndex),
                            ...expanded.slice(pathIndex + 1),
                        ]

                setExpanded(updatedExpanded)
            }
        },
        [expanded, setExpanded]
    )
    const update = useCallback(
        (nextOrgUnits, nextExpanded) => {
            if (onChange) {
                onChange(nextOrgUnits.map((unit) => unit.id))
                // Also call onBlur if this is available. In a redux-form the component will be 'touched' by it
               onBlur && onBlur()
            }

            setSelectedOrgUnits(nextOrgUnits)

            if (nextExpanded) {
                setExpanded(nextExpanded)
            }
        },
        [onChange, onBlur, setSelectedOrgUnits, setExpanded]
    )

    const toggleSelectedOrgUnits = useCallback(
        ({ id, path, displayName }) => {
            const orgUnitIndex = selectedOrgUnits.findIndex((u) => u.id === id)
            const nextOrgUnits =
                orgUnitIndex === -1
                    ? [...selectedOrgUnits, { id, path, displayName }]
                    : [
                          ...selectedOrgUnits.slice(0, orgUnitIndex),
                          ...selectedOrgUnits.slice(orgUnitIndex + 1),
                      ]

            update(nextOrgUnits)
        },
        [selectedOrgUnits, update]
    )


    const selectedOrgUnitPaths = useMemo(
        () => selectedOrgUnits.map(({ path }) => path),
        [selectedOrgUnits]
    )

  const onSelect = (path) => {
    if (multiselect ) {
      const newValue = !selected.includes(path)
      if (newValue === false) {
          const newSelected = selected.filter((p) => p !== path);
          setSelected(newSelected)
      } 
      else {
          const sel = [...selected, path];
          setSelected(sel);
      }
    } 
    else {
        setSelected([path]);     
    }   
  }
  const onDeSelect = (e) => {
    if (multiselect) {
      const newValue = !selectedItem.includes(e)
      if (newValue === false) {
          const newSelected = selectedItem.filter((p) => p?.path !== e?.path);
          setSelectedItem(newSelected)
      } 
      else {
          const sel = uniqBy([...selectedItem, ...[e]],'path');
          setSelectedItem(sel);
      }
    } 
    else {
        setSelectedItem(e);     
    }     
  }
  const getLabel =(e)=>{
    onSelect(e?.path);
    onDeSelect(e);
    getSelected(e);
  }
 
const pickOrgUnit =(e)=>{
    if(e?.target){
        onChange(path,e.target?.value??'');
    }
}
return (
              <Dialog
                disableEscapeKeyDown
                fullScreen = { fullScreen }
                aria-labelledby={ `form-dialog-orgunit` }
                open={open}
                onClose={handleClose}>
                <DialogTitle id="max-width-dialog-title">Choose Organisation Unit</DialogTitle>
                <DialogContent dividers>
                  <div css={ card}>
                    {
                      <LocationTree
                        onChange={ pickOrgUnit }
                        label = {''}
                        accessRoots = { roots??[] }
                        roots = { roots??[] }
                        loading = { loading }
                        getSelected = { getSelected }
                        getNode = { getLabel }
                        multiSelect = { false }
                        error = { error }
                        selected = { selected }
                        isUserDataViewFallback= { 
                          true
                        }
                        expanded={expanded}
                        handleExpand={handleExpand}
                        handleCollapse={handleCollapse}
                        selectionLevel ={ selectionLevel }
                        enableSelectionLevel={ enableSelectionLevel}
                      />
                    }
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
  );
};
