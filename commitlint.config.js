/**
 * Configuración de commitlint para enforcing Conventional Commits
 * Ref: https://commitlint.js.org/#/
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos (siguiendo conventional commits)
    'type-enum': [
      2,
      'always',
      [
        'build', // Cambios que afectan el sistema de build o dependencias externas
        'chore', // Cambios de mantenimiento que no modifican src o test files
        'ci', // Cambios en archivos de configuración de CI
        'docs', // Solo cambios en documentación
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bugs
        'perf', // Cambios de código que mejoran el performance
        'refactor', // Cambio de código que no corrige bugs ni añade funcionalidad
        'revert', // Revierte un commit previo
        'style', // Cambios que no afectan el significado del código (formato, etc.)
        'test', // Añadir tests faltantes o corregir tests existentes
      ],
    ],
    // El subject debe estar en lower-case
    'subject-case': [2, 'always', 'lower-case'],
    // El subject no puede estar vacío
    'subject-empty': [2, 'never'],
    // El subject no debe terminar con punto
    'subject-full-stop': [2, 'never', '.'],
    // Longitud máxima del header
    'header-max-length': [2, 'always', 100],
    // Longitud mínima del subject
    'subject-min-length': [2, 'always', 3],
  },
}
