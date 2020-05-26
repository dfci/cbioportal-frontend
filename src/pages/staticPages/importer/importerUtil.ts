export function dateOrNever(date: string | undefined | null): string {
    const regex = /\.\d\d\dZ/;
    return date ? new Date(date).toISOString().replace("T0", " ").replace(regex, "") : "Never"
}