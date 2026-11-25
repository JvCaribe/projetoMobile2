import { useIonToast } from '@ionic/react';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';

import './avisos.css';

type TipoAviso = 'sucesso' | 'erro' | 'info';

const ICONES: Record<TipoAviso, string> = {
  sucesso: checkmarkCircleOutline,
  erro: alertCircleOutline,
  info: informationCircleOutline,
};

/**
 * Avisos dentro do app (no lugar do alert() do navegador).
 *
 * Uso:
 *   const aviso = useAviso();
 *   aviso.sucesso('Transação salva com sucesso!');
 *   aviso.erro('Não foi possível salvar.');
 *   aviso.info('Nenhuma alteração feita.');
 *
 * O aviso continua visível mesmo se a tela mudar logo em seguida
 * (por exemplo, depois do navigate).
 */
export function useAviso() {
  const [apresentar, dispensar] = useIonToast();

  const mostrar = (tipo: TipoAviso, mensagem: string) => {
    void dispensar(); // evita empilhar vários avisos
    void apresentar({
      message: mensagem,
      duration: tipo === 'erro' ? 4000 : 2500,
      position: 'top',
      icon: ICONES[tipo],
      cssClass: `aviso aviso--${tipo}`,
    });
  };

  return {
    sucesso: (mensagem: string) => mostrar('sucesso', mensagem),
    erro: (mensagem: string) => mostrar('erro', mensagem),
    info: (mensagem: string) => mostrar('info', mensagem),
  };
}
