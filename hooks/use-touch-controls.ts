'use client';
import {useEffect,useState} from 'react';
export function useTouchControls(){const [touch,set]=useState(false);useEffect(()=>{const m=matchMedia('(pointer: coarse), (max-width: 800px)');const update=()=>set(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);return touch;}
