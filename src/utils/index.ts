export function toArabicNumerals(num: number): string {
    const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => digits[parseInt(w, 10)]);
}

export function cleanArabicText(text: string) {
    return (
        text
            // remove ayah end symbol ۝
            .replace(/\u06DD/g, '')

            // remove standalone eastern arabic numerals
            .replace(/[\u0660-\u0669]+/g, '')

            // remove extra whitespace
            .replace(/\s+/g, ' ')
            .trim()
    );
}
