import defaultJSON from "./Custom.json";
import defaultSRTB from "./Custom.srtb?raw";
import diffIndex from "./Diff Index.json";
import diffHeader from "./Diff Header.json";
import diffBody from "./Diff Body.json";
import inertia from "./Inertia.srtb?raw";

export const templates = {
    "Custom.json": defaultJSON,
    "Custom.srtb": JSON.parse(defaultSRTB),
    "Diff Index.json": diffIndex,
    "Diff Header.json": diffHeader,
    "Diff Body.json": diffBody,
    "Inertia.srtb": JSON.parse(inertia)
}