// @pca:start
// @id(feature.homeview.view)
// @kind(view)
// @limit(lines: 300)
// @contract(HomeViewView(props: HomeViewContract))
// @relates(feature.homeview.interface)
// @relates(feature.homeview.dependencies)
// @desc(Implementación visual principal del módulo HomeView)
// @pca:end

/**
 * FIDA - Feature & View Layer (F/V)
 *
 * View Implementation for: HomeView
 * Created: 2026-10-31
 *
 * Implementación visual obediente al contrato IHomeView.
 * Importa recursos externos exclusivamente desde ../dependencies/dependencies.
 */

import type { HomeViewContract } from "../dependencies/dependencies";

export const HomeViewView = (props: HomeViewContract) => {
  const { title = "HomeView", onAction } = props;
  return {
    title,
    triggerAction: () => onAction?.(),
  };
};
