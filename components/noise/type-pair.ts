import {useEffect} from 'react';
/** Preview-only baseline for comparing explanatory text with the 620bca2 type system. */
export function useTypePair(){useEffect(()=>{if(process.env.NODE_ENV!=='development'&&location.hostname!=='velmont-next-preview.iamtemmy.chatgpt.site')return;if(!new URLSearchParams(location.search).has('fontBaseline'))return;document.body.dataset.fontBaseline='true';return()=>{delete document.body.dataset.fontBaseline;};},[]);}
