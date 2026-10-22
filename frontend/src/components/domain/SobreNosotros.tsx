// @pca:start
// @id(frontend.domain.sobreNosotros)
// @kind(component)
// @limit(lines: 60)
// @contract(sin props)
// @relates(docs.reglas_ui)
// @desc(Bloque de texto e imagen 'Quiénes Somos' de la Home)
// @pca:end
/**
 * Bloque "Quiénes somos" de la Home: texto a la izquierda, foto a la derecha.
 * En mobile el `flex-wrap` apila la foto bajo el texto.
 */
export function SobreNosotros() {
  return (
    <section className="mb-8 flex flex-wrap items-center gap-8 rounded-xl border border-tertiary/[0.12] bg-white p-6 shadow-[0_1px_3px_rgba(93,64,55,0.06)] sm:gap-12 sm:p-8">
      <div className="basis-[320px] flex-1">
        <span className="mb-2 block font-body text-[0.78rem] font-bold uppercase tracking-[0.08em] text-secondary">
          Nuestra Historia
        </span>
        <h2 className="mb-4 text-left">Quiénes Somos</h2>
        <p className="mb-4 max-w-[65ch]">
          En Crème &amp; Co, la pastelería es más que una profesión; es una tradición
          familiar. Desde nuestros humildes inicios en una pequeña cocina hasta
          convertirnos en tu rincón dulce favorito, siempre hemos mantenido un
          compromiso inquebrantable con la calidad.
        </p>
        <p className="mb-4 max-w-[65ch]">
          Cada torta, cada galleta y cada postre es elaborado a mano diariamente
          utilizando solo ingredientes 100% naturales y mucho amor. Creemos que cada
          celebración merece un toque mágico, y estamos aquí para hornearlo para ti.
        </p>
      </div>

      <figure className="basis-[320px] flex-1 overflow-hidden rounded-xl">
        <img
          src="/imagen/macarons.jpg"
          alt="Macarons artesanales recién horneados de Crème &amp; Co"
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] h-full w-full object-cover"
        />
      </figure>
    </section>
  );
}
