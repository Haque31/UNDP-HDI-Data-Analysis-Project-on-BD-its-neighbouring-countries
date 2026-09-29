import { formatInteger, formatOneDecimal } from "./chartConstants";

export default function InsightPanel({ indicator, components, metric }) {
    const bangladesh = components?.find(({ iso3 }) => iso3 === "BGD");
    const india = components?.find(({ iso3 }) => iso3 === "IND");

    return (
        <aside className="insight-panel" aria-label="What this means for Bangladesh">
            <h3>What this means for Bangladesh</h3>
            {indicator === "hdi" && <>
                <p>Bangladesh and Pakistan had almost identical HDI in 1990: 0.397 and 0.396, respectively, 19 years after their 1971 split. Their recorded paths diverged steadily afterward.</p>
                <p>By 2023, Bangladesh and India shared an HDI of 0.685 and global rank 130. For Bangladesh, the next question is where differences remain beneath that shared score: health, education, income and inequality deserve attention separately.</p>
                <p>The historical markers provide context. This dataset has no governance, policy or conflict data and cannot explain why the paths differ.</p>
            </>}
            {indicator === "components" && !metric && bangladesh && india && <>
                <p>Bangladesh's life expectancy is {formatOneDecimal(bangladesh.le)} years, compared with India's {formatOneDecimal(india.le)} in 2023. Yet Bangladesh records {formatOneDecimal(bangladesh.eys)} expected years of schooling and {formatOneDecimal(bangladesh.mys)} mean years, compared with {formatOneDecimal(india.eys)} and {formatOneDecimal(india.mys)} in India.</p>
                <p>GNI per person is {formatInteger(bangladesh.gnipc)} in Bangladesh and {formatInteger(india.gnipc)} in India, measured in 2021 PPP dollars. Alongside the health comparison, these education and income gaps are areas for Bangladesh to examine next. The charts do not identify which actions would close them.</p>
            </>}
            {indicator === "components" && metric === "le" && bangladesh && india && <>
                <p>Bangladesh's life expectancy at birth is {formatOneDecimal(bangladesh.le)} years in 2023, compared with {formatOneDecimal(india.le)} in India. Bangladesh stands above India on this health measure.</p>
                <p>This is one part of the development picture. Use the selector to compare education and income too; a higher life expectancy does not mean Bangladesh leads on every component.</p>
            </>}
            {indicator === "components" && metric === "eys" && bangladesh && india && <>
                <p>Bangladesh records {formatOneDecimal(bangladesh.eys)} expected years of schooling in 2023, compared with {formatOneDecimal(india.eys)} in India. Bangladesh remains below India on this measure.</p>
                <p>This gap deserves attention alongside Bangladesh's health comparison. Expected schooling is a different measure from completed schooling; switch to mean years for that comparison.</p>
            </>}
            {indicator === "components" && metric === "mys" && bangladesh && india && <>
                <p>Bangladesh records {formatOneDecimal(bangladesh.mys)} mean years of schooling in 2023, close to India's {formatOneDecimal(india.mys)} years, but still lower.</p>
                <p>For Bangladesh, this is a useful education benchmark alongside expected schooling. The chart measures years, so it cannot tell us how much students learn or the quality of their education.</p>
            </>}
            {indicator === "components" && metric === "gnipc" && bangladesh && india && <>
                <p>Bangladesh's GNI per person is {formatInteger(bangladesh.gnipc)} in 2023, compared with {formatInteger(india.gnipc)} in India, measured in 2021 PPP dollars.</p>
                <p>Bangladesh remains below India on this income measure. It is a national average, not a typical person's earnings, and does not show how income is distributed.</p>
            </>}
            {indicator === "inequality" && <>
                <p>Bangladesh loses roughly 30% of its HDI when inequality is taken into account. Across these comparisons, Bangladesh, India and Pakistan lose roughly 30–36%, while China loses about 16–17%.</p>
                <p>For Bangladesh, the national HDI score is only part of the picture. The size of this loss makes inequality an important focus alongside the headline score; the chart does not tell us which groups face the largest gaps or which measures would reduce them.</p>
            </>}
            {indicator === "gii" && <>
                <p>Bangladesh's 2023 GII is 0.487, compared with India's 0.403 and Pakistan's 0.536. Lower is better. China's 0.132 shows how much lower gender inequality is on this measure among these four countries.</p>
                <p>Bangladesh sits between India and Pakistan, with a substantial gap to China. Gender inequality deserves attention in its own right, even where Bangladesh and India share the same overall HDI.</p>
                <p>Bangladesh's sharp jumps around 2001–2004 and 2008, and Pakistan's around 2003, are likely data/survey artifacts. They coincide with implausible one-year swings in inputs such as women's secondary education attainment and should not be read as real one-year changes.</p>
            </>}
        </aside>
    );
}
