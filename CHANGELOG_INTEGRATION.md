# Relatório de Mudanças - Integração de Cartões e Dívidas

## O que foi feito:
1.  **Renomeação Estrutural**:
    *   O menu "Integrações" foi renomeado para **"Cartões"**.
    *   A página principal de gerenciamento de contas agora se chama **"Meus Cartões e Contas"**.
2.  **Integração Automática de Faturas**:
    *   O sistema agora monitora as faturas de cartão de crédito cadastradas.
    *   Sempre que um cartão possui uma fatura maior que zero, uma dívida correspondente é **criada automaticamente** na área de "Dívidas".
    *   Se o valor da fatura mudar na área de "Cartões", a dívida é atualizada em tempo real.
3.  **Fluxo de Pagamento Inteligente**:
    *   Ao pagar uma parcela ou a fatura total na área de "Dívidas", o sistema agora:
        *   Registra a transação no extrato.
        *   **Abate o valor do saldo bancário** automaticamente (priorizando a conta do próprio cartão ou a conta com saldo disponível).
        *   Se for uma fatura de cartão, o valor da fatura é zerado na área de "Cartões".
4.  **Interface de Usuário**:
    *   Dívidas originadas de faturas de cartão agora possuem um destaque visual (cor de destaque e etiqueta "Fatura de Cartão") para diferenciação.
    *   Faturas automáticas não podem ser editadas ou excluídas manualmente na área de dívidas, garantindo a integridade dos dados sincronizados.

## Próximos Passos Sugeridos:
- Adicionar notificações de vencimento de fatura.
- Implementar histórico de faturas pagas.

