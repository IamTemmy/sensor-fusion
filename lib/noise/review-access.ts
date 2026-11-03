/** The review harnesses are served only in development or on the isolated test site. */
export function reviewAllowed(hostname:string,environment:string|undefined){
 return environment==='development'||hostname==='velmont-next-preview.iamtemmy.chatgpt.site';
}
