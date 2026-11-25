# Drupal: corrigida num dia, explorada no outro

- Data: 2026-11-25 · Peso: aprofundado · Formato: caso · Horário: 14:30

## Dados e fontes

- Dado: CVE-2026-132165, SA-CORE-2026-017, "Highly critical 20/25", RCE via install.php; atacante pode tentar reinstalar o Drupal → tomada do site ou execução remota de código; Authentication: None; "Only uncommon module configurations are exploitable".
  Fonte: https://www.drupal.org/sa-core-2026-017 (18/11/2026)
- Dado: versões corrigidas 10.6.22, 11.3.22, 11.4.13; 11.2.x e 10.5.x ou anteriores sem cobertura (fim de vida).
  Fonte: mesmo aviso.
- Dado: "exploited on live sites as early as 2026-11-19 19:00 UTC" (relato recebido pelo Security Team).
  Fonte: atualização no mesmo aviso.
- Dado: parte dos caminhos de exploração é mitigada se o servidor web não puder escrever/alterar permissões do settings.php; sem atualizar, proteger o instalador.
  Fonte: mesmo aviso.
- Dado: "Discovered by Anthropic's OSS Scanner".
  Fonte: mesmo aviso.
- Dado: aviso prévio de release em 16/11 (PSA-2026-11-16), release em 18/11 entre 17h e 21h UTC.
  Fonte: https://www.drupal.org/security
- Dado: CISA KEV — adicionada em 24/11/2026, prazo 27/11/2026; "unauthenticated attacker".
  Fonte: https://www.cisa.gov/known-exploited-vulnerabilities-catalog

## Não confirmado (fora do post)
- Detalhes da reportagem da SecurityWeek (página bloqueada).
- Número de sites afetados; CVSS.
