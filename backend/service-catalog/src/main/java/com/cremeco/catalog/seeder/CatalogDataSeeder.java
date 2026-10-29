package com.cremeco.catalog.seeder;

import com.cremeco.catalog.model.BlogPostEntity;
import com.cremeco.catalog.model.CategoryEntity;
import com.cremeco.catalog.model.ProductEntity;
import com.cremeco.catalog.model.PromotionEntity;
import com.cremeco.catalog.repository.BlogPostRepository;
import com.cremeco.catalog.repository.CategoryRepository;
import com.cremeco.catalog.repository.ProductRepository;
import com.cremeco.catalog.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogDataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final BlogPostRepository blogPostRepository;

    @Override
    public void run(String... args) {
        seedCategories();
        seedProducts();
        seedPromotions();
        seedBlogPosts();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Sembrando categorías en MySQL...");
            categoryRepository.saveAll(List.of(
                    new CategoryEntity(null, "tortas", "Tortas Tradicionales", "Elaboradas con bizcochos húmedos y rellenos artesanales", "/imagen/Torta-Opera-Francesa.webp", true),
                    new CategoryEntity(null, "tartaletas", "Tartaletas & Pies", "Masa quebrada crujiente con cremas y frutas de temporada", "/imagen/Tarta-de-Limon-y-Merengue.webp", true),
                    new CategoryEntity(null, "cheesecake", "Cheesecakes Horneados", "Cremosos y suaves con mermeladas y frutos rojos seleccionados", "/imagen/Cheesecake-de-Frutos-Rojos.webp", true),
                    new CategoryEntity(null, "pasteles", "Bollería & Pasteles", "Croissants, hojaldres y bocados individuales recién horneados", "/imagen/Croissant.webp", true),
                    new CategoryEntity(null, "sin-gluten", "Línea Sin Gluten", "Preparaciones certificadas sin trigo, avena, cebada ni centeno", "/imagen/Pancakes.webp", true)
            ));
        }
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            log.info("Sembrando 12 productos iniciales en MySQL...");
            productRepository.saveAll(List.of(
                    ProductEntity.builder()
                            .nombre("Torta Ópera Francesa")
                            .descripcion("Elegante clásica francesa con capas de bizcocho Joconde empapado en café, ganache de chocolate y crema de mantequilla al café.")
                            .precio(24990L).precioAnterior(28990L).enOferta(true)
                            .categoria("tortas").categoriasCsv("torta,tortas").variacionesCsv("vendido")
                            .porciones("12, 20 personas").imagen("/imagen/Torta-Opera-Francesa.webp")
                            .badge("vendido").destacado(true).disponible(true).stock(8).stockMinimo(5).ventasHistoricas(142).build(),

                    ProductEntity.builder()
                            .nombre("Cheesecake de Frutos Rojos")
                            .descripcion("Cremoso cheesecake horneado estilo Nueva York sobre base crocante de galleta y coulis casero de frambuesas y moras.")
                            .precio(21990L).precioAnterior(21990L).enOferta(false)
                            .categoria("tortas").categoriasCsv("torta,cheesecake").variacionesCsv("temporada")
                            .porciones("10, 16 personas").imagen("/imagen/Cheesecake-de-Frutos-Rojos.webp")
                            .badge("temporada").destacado(true).disponible(true).stock(12).stockMinimo(5).ventasHistoricas(98).build(),

                    ProductEntity.builder()
                            .nombre("Torta Selva Negra Tradicional")
                            .descripcion("Bizcocho de chocolate humedecido en kirsch con crema chantilly fresca, cerezas amarenas y virutas de chocolate bitter.")
                            .precio(23990L).precioAnterior(26990L).enOferta(true)
                            .categoria("tortas").categoriasCsv("torta,tortas").variacionesCsv("vendido")
                            .porciones("15, 25 personas").imagen("/imagen/Torta-Selva-Negra-Tradicional.webp")
                            .badge("vendido").destacado(true).disponible(true).stock(5).stockMinimo(4).ventasHistoricas(64).build(),

                    ProductEntity.builder()
                            .nombre("Tarta de Limón y Merengue")
                            .descripcion("Masa sableé crujiente rellena con crema de limón intensa y cubierta con merengue suizo dorado al soplete.")
                            .precio(18990L).precioAnterior(18990L).enOferta(false)
                            .categoria("tartaletas").categoriasCsv("tartaleta,tartas").variacionesCsv("personalizable")
                            .porciones("8, 12 personas").imagen("/imagen/Tarta-de-Limon-y-Merengue.webp")
                            .badge("personalizable").destacado(false).disponible(true).stock(15).stockMinimo(6).ventasHistoricas(82).build(),

                    ProductEntity.builder()
                            .nombre("Croissant de Mantequilla")
                            .descripcion("Hojaldrado artesanal francés elaborado con mantequilla pura al 82%, de corteza crocante e interior alveolado.")
                            .precio(3500L).precioAnterior(3500L).enOferta(false)
                            .categoria("pasteles").categoriasCsv("pastel,bolleria").variacionesCsv("vendido")
                            .porciones("Individual").imagen("/imagen/Croissant.webp")
                            .badge("vendido").destacado(true).disponible(true).stock(25).stockMinimo(10).ventasHistoricas(310).build(),

                    ProductEntity.builder()
                            .nombre("Pancakes Sin Gluten con Frutos del Bosque")
                            .descripcion("Torre esponjosa de panqueques elaborados con harina de almendras y arroz, bañados en miel de maple y arándanos.")
                            .precio(8990L).precioAnterior(9990L).enOferta(true)
                            .categoria("sin-gluten").categoriasCsv("pancakes,sin gluten").variacionesCsv("sin gluten")
                            .porciones("Individual / Para compartir").imagen("/imagen/Pancakes.webp")
                            .badge("premium").destacado(true).disponible(true).stock(14).stockMinimo(6).ventasHistoricas(35).build(),

                    ProductEntity.builder()
                            .nombre("Torta de Chocolate y Frutillas")
                            .descripcion("Tres niveles de bizcochuelo de cacao belga rellenos con ganache de chocolate de leche y frutillas naturales.")
                            .precio(35000L).precioAnterior(35000L).enOferta(false)
                            .categoria("tortas").categoriasCsv("torta,tortas").variacionesCsv("personalizable")
                            .porciones("12, 20 personas").imagen("/imagen/chocolate.jpg")
                            .badge("personalizable").destacado(false).disponible(true).stock(4).stockMinimo(5).ventasHistoricas(48).build(),

                    ProductEntity.builder()
                            .nombre("Torta Tres Leches Clásica")
                            .descripcion("Tradicional bizcochuelo embebido en mezcla de tres leches con canela, manjar artesanal y merengue tostado.")
                            .precio(28990L).precioAnterior(32000L).enOferta(true)
                            .categoria("tortas").categoriasCsv("torta,tortas").variacionesCsv("vendido")
                            .porciones("15, 25 personas").imagen("/imagen/tres_leches.jpg")
                            .badge("vendido").destacado(true).disponible(true).stock(6).stockMinimo(4).ventasHistoricas(84).build(),

                    ProductEntity.builder()
                            .nombre("Pastel de Zanahoria y Especias")
                            .descripcion("Pastel especiado con canela, nueces tostadas y jengibre, coronado con un suave frosting de queso crema Philadelphia.")
                            .precio(26000L).precioAnterior(26000L).enOferta(false)
                            .categoria("tortas").categoriasCsv("torta,tortas").variacionesCsv("temporada")
                            .porciones("10, 15 personas").imagen("/imagen/zanahoria.jpg")
                            .badge("temporada").destacado(false).disponible(true).stock(9).stockMinimo(5).ventasHistoricas(42).build(),

                    ProductEntity.builder()
                            .nombre("Caja de Macarons Artesanales (12 uds)")
                            .descripcion("Delicados bocados parisinos con harina de almendras en sabores vainilla Bourbon, pistacho, frambuesa y chocolate 70%.")
                            .precio(15990L).precioAnterior(15990L).enOferta(false)
                            .categoria("pasteles").categoriasCsv("pastel,individuales").variacionesCsv("premium")
                            .porciones("12 unidades").imagen("/imagen/macarons.jpg")
                            .badge("premium").destacado(true).disponible(true).stock(18).stockMinimo(8).ventasHistoricas(120).build(),

                    ProductEntity.builder()
                            .nombre("Tartaleta Rústica de Frambuesas")
                            .descripcion("Masa de mantequilla dorada rellena con crema pastelera a la vainilla y abundante fruta fresca del sur de Chile.")
                            .precio(19990L).precioAnterior(22000L).enOferta(true)
                            .categoria("tartaletas").categoriasCsv("tartaleta,tartas").variacionesCsv("temporada")
                            .porciones("8, 12 personas").imagen("/imagen/tartaleta.jpg")
                            .badge("temporada").destacado(false).disponible(true).stock(3).stockMinimo(5).ventasHistoricas(56).build(),

                    // Producto borrador sin ventas históricas para probar eliminación segura
                    ProductEntity.builder()
                            .nombre("Torta Prototipo Experimental (Borrador)")
                            .descripcion("Producto de prueba nuevo en catálogo para verificar eliminación segura en el panel de administración.")
                            .precio(19990L).precioAnterior(19990L).enOferta(false)
                            .categoria("tortas").categoriasCsv("torta,tortas").variacionesCsv("")
                            .porciones("8 personas").imagen("/imagen/Torta-Opera-Francesa.webp")
                            .badge("").destacado(false).disponible(false).stock(10).stockMinimo(5).ventasHistoricas(0).build()
            ));
        }
    }

    private void seedPromotions() {
        if (promotionRepository.count() == 0) {
            log.info("Sembrando cupones de descuento en MySQL...");
            promotionRepository.saveAll(List.of(
                    new PromotionEntity(null, "CREME10", "PORCENTAJE", 10, 10L, 20000L, 12, 100, "2026-12-31", true, "10% de descuento en el total de tu compra"),
                    new PromotionEntity(null, "DULCE15", "PORCENTAJE", 15, 15L, 25000L, 45, 150, "2026-12-31", true, "15% de descuento especial"),
                    new PromotionEntity(null, "DULCE10", "PORCENTAJE", 10, 10L, 20000L, 34, 100, "2026-11-30", true, "10% de descuento en el total"),
                    new PromotionEntity(null, "CREME20", "PORCENTAJE", 20, 20L, 30000L, 18, 50, "2026-11-30", true, "20% en pedidos sobre $30.000"),
                    new PromotionEntity(null, "BIENVENIDA", "PORCENTAJE", 15, 15L, 15000L, 89, 200, "2026-12-31", true, "15% para clientes nuevos"),
                    new PromotionEntity(null, "PRIMERACOMPRA", "PORCENTAJE", 15, 15L, 20000L, 62, 100, "2026-12-31", true, "15% en tu primera orden")
            ));
        }
    }

    private void seedBlogPosts() {
        if (blogPostRepository.count() == 0) {
            log.info("Sembrando artículos de blog en MySQL...");
            blogPostRepository.saveAll(List.of(
                    BlogPostEntity.builder()
                            .slug("el-arte-del-croissant-perfecto")
                            .titulo("El arte del croissant perfecto: secretos de nuestro hojaldre")
                            .extracto("Descubre cómo logramos esas capas crujientes y doradas que se deshacen en tu boca con mantequilla artesanal pura.")
                            .contenidoJson("El secreto de un verdadero croissant radica en la paciencia y la temperatura. Cada mañana a las 5:00 AM, nuestros panaderos comienzan el proceso de laminado en frío.|||Utilizamos mantequilla de campo con un 82% de tenor graso, lo que garantiza que las capas no se mezclen con la masa fermentada.|||El resultado es una textura ligera como una nube, con más de 27 capas crujientes por pieza.")
                            .autor("Nicolás Pastelería")
                            .categoria("recetas")
                            .imagen("/imagen/Croissant.webp")
                            .tiempoLectura("4 min")
                            .fecha("2026-10-20")
                            .build(),

                    BlogPostEntity.builder()
                            .slug("nuevos-sabores-de-temporada-primavera")
                            .titulo("Nuevos sabores de temporada: Fresas silvestres y flor de sauco")
                            .extracto("Esta primavera renovamos nuestra vitrina con frutas cosechadas directamente de productores locales de la región.")
                            .contenidoJson("La primavera ha llegado a Crème & Co con aromas florales y frutos rojos frescos recién cosechados.|||Presentamos nuestra tartaleta de fresas silvestres infusionada con sirope natural de flor de sauco y crema chantilly ligera.|||Ven a degustarla en nuestro salón de té durante todo este mes.")
                            .autor("Camila Silva")
                            .categoria("novedades")
                            .imagen("/imagen/Cheesecake-de-Frutos-Rojos.webp")
                            .tiempoLectura("3 min")
                            .fecha("2026-10-22")
                            .build(),

                    BlogPostEntity.builder()
                            .slug("guia-para-conservar-tus-tortas")
                            .titulo("Guía práctica: Cómo conservar tus tortas y postres en casa")
                            .extracto("Consejos indispensables de nuestros reposteros para mantener la frescura, sabor y textura intactos por días.")
                            .contenidoJson("A menudo nos preguntan cuánto tiempo puede durar una torta artesanal sin perder su magia.|||Para tortas húmedas de bizcochuelo con cremas lácteas, la refrigeración entre 4°C y 6°C dentro de su caja o campana es vital para evitar que absorba otros olores.|||Recomendamos retirarla del frío 20 minutos antes de servir para apreciar toda la intensidad de sus sabores.")
                            .autor("Rodrigo Tapia")
                            .categoria("consejos")
                            .imagen("/imagen/Torta-Opera-Francesa.webp")
                            .tiempoLectura("5 min")
                            .fecha("2026-10-24")
                            .build()
            ));
        }
    }
}
