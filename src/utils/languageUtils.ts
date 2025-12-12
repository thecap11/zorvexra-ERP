/**
 * Language utility functions for detecting and filtering language periods
 */

export type LanguageType = 'GERMAN' | 'FRENCH' | null;

/**
 * Detect if a subject is a language period
 */
export function isLanguagePeriod(subject: string): boolean {
    const subjectLower = subject.toLowerCase();
    return (
        subjectLower.includes('german') ||
        subjectLower.includes('french') ||
        subjectLower.includes('language')
    );
}

/**
 * Extract which language from the subject name
 * Returns 'GERMAN', 'FRENCH', or null if not a language period or ambiguous
 */
export function getLanguageFromSubject(subject: string): LanguageType {
    const subjectLower = subject.toLowerCase();

    const hasGerman = subjectLower.includes('german');
    const hasFrench = subjectLower.includes('french');

    // If it contains both or neither (just "LANGUAGE"), return null
    if ((hasGerman && hasFrench) || (!hasGerman && !hasFrench)) {
        return null;
    }

    if (hasGerman) return 'GERMAN';
    if (hasFrench) return 'FRENCH';

    return null;
}

/**
 * Filter students based on language preference for a given subject
 * If not a language period, returns all students
 */
export function filterStudentsByLanguage<T extends { preferredLanguage?: 'GERMAN' | 'FRENCH' | null }>(
    students: T[],
    subject: string
): T[] {
    if (!isLanguagePeriod(subject)) {
        return students;
    }

    const language = getLanguageFromSubject(subject);

    // If we can't determine the specific language, don't filter
    if (language === null) {
        return students;
    }

    return students.filter(student => student.preferredLanguage === language);
}

/**
 * Count students without language preference
 */
export function countStudentsWithoutLanguage<T extends { preferredLanguage?: 'GERMAN' | 'FRENCH' | null }>(
    students: T[]
): number {
    return students.filter(student => !student.preferredLanguage).length;
}
