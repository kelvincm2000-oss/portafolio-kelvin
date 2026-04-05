import { gsap } from "gsap";
// Usar importación consolidada de gsap/all para evitar conflictos de casing de plugins en TS/Windows
import { ScrollTrigger, Observer, CustomEase } from "gsap/all";

// Register plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, Observer, CustomEase);
    
    // Configuración global de GSAP para performance
    gsap.config({
        nullTargetWarn: false,
        autoSleep: 60
    });
}

export { gsap, ScrollTrigger, Observer, CustomEase };
export default gsap;
