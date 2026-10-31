// @pca:start
// @id(feature.[MODULE_ID].view)
// @kind(view)
// @limit(lines: 300)
// @contract([MODULE_NAME]View(props: [MODULE_NAME]Contract))
// @relates(feature.[MODULE_ID].interface)
// @relates(feature.[MODULE_ID].dependencies)
// @desc(Implementación visual principal del módulo [MODULE_NAME])
// @pca:end

/**
 * FIDA - Feature & View Layer (F/V)
 *
 * View Implementation for: [MODULE_NAME]
 * Created: [DATE]
 *
 * Implementación visual obediente al contrato I[MODULE_NAME].
 * Importa recursos externos exclusivamente desde ../dependencies/dependencies.
 */

import type { [MODULE_NAME]Contract } from "../dependencies/dependencies";

export const [MODULE_NAME]View = (props: [MODULE_NAME]Contract) => {
  const { title = "[MODULE_NAME]", onAction } = props;
  return {
    title,
    triggerAction: () => onAction?.(),
  };
};
