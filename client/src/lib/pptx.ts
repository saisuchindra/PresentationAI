import pptxgen from 'pptxgenjs';

export interface SlideContent {
  id: string;
  title: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'quote' | 'references';
  bullets?: string[];
  chartData?: { label: string; value: number }[];
  chartType?: 'bar' | 'pie' | 'line';
  tableData?: string[][];
  quote?: string;
  quoteAuthor?: string;
  image?: {
    url: string;
    description: string;
    photographer: string;
    photographerUrl: string;
  };
  imageSearchQuery?: string;
}

export interface Presentation {
  id: string;
  topic: string;
  mode: 'traditional' | 'professional';
  model: string;
  outline: string[];
  slides: SlideContent[];
  createdAt?: string;
}

export async function generatePPTX(pres: Presentation) {
  const pptx = new pptxgen();
  
  // Set Presentation metadata
  pptx.title = pres.topic;
  pptx.subject = 'AI Generated Presentation';
  pptx.author = 'PresentationAI';

  const isDark = pres.mode === 'professional';

  // Styling Configuration
  const theme = {
    bg: isDark ? '0F172A' : 'F9FAFB', // Dark Slate vs Cool Gray
    textMain: isDark ? 'F1F5F9' : '1E293B',
    textMuted: isDark ? '94A3B8' : '64748B',
    primary: isDark ? 'A78BFA' : '6366F1', // Lavender vs Indigo
    accent: isDark ? '38BDF8' : '0EA5E9',  // Light Blue vs Ocean Blue
    cardBg: isDark ? '1E293B' : 'FFFFFF',
    border: isDark ? '334155' : 'E2E8F0',
    fontTitle: pres.mode === 'professional' ? 'Trebuchet MS' : 'Arial',
    fontBody: 'Calibri',
  };

  // Helper to add background
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setBackground = (slide: any) => {
    slide.background = { fill: theme.bg };
  };

  // Helper to add a slide header
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addSlideHeader = (slide: any, title: string) => {
    slide.addText(title, {
      x: 0.8,
      y: 0.5,
      w: 11.5,
      h: 0.8,
      fontSize: 28,
      fontFace: theme.fontTitle,
      color: theme.primary,
      bold: true,
      valign: 'middle',
    });
  };

  // Generate each slide
  pres.slides.forEach((slideContent) => {
    const slide = pptx.addSlide();
    setBackground(slide);

    switch (slideContent.type) {
      case 'title': {
        // Main Title Slide Layout
        // Let's do a beautiful modern split layout
        if (isDark) {
          // Dark Modern Layout
          // Draw a nice subtle decorative accent bar on the left
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: 2.2,
            w: 0.15,
            h: 2.8,
            fill: { color: theme.primary },
          });

          slide.addText(slideContent.title, {
            x: 1.2,
            y: 2.0,
            w: 11.0,
            h: 1.8,
            fontSize: 48,
            fontFace: theme.fontTitle,
            color: theme.textMain,
            bold: true,
            valign: 'middle',
          });

          slide.addText(slideContent.bullets?.[0] || `Generated research presentation on ${pres.topic}`, {
            x: 1.2,
            y: 3.8,
            w: 11.0,
            h: 0.8,
            fontSize: 20,
            fontFace: theme.fontBody,
            color: theme.textMuted,
            valign: 'top',
          });

          slide.addText('PresentationAI • Professional Mode', {
            x: 1.2,
            y: 6.2,
            w: 8.0,
            h: 0.4,
            fontSize: 12,
            fontFace: theme.fontBody,
            color: theme.primary,
            bold: true,
          });
        } else {
          // Traditional Slide Layout
          // Box background for the header title
          slide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: 13.33,
            h: 0.15,
            fill: { color: theme.primary },
          });

          slide.addText(slideContent.title, {
            x: 1.0,
            y: 2.2,
            w: 11.33,
            h: 1.5,
            fontSize: 44,
            fontFace: theme.fontTitle,
            color: theme.textMain,
            bold: true,
            align: 'center',
            valign: 'middle',
          });

          slide.addText(slideContent.bullets?.[0] || `Academic Presentation`, {
            x: 1.0,
            y: 3.7,
            w: 11.33,
            h: 0.8,
            fontSize: 22,
            fontFace: theme.fontBody,
            color: theme.textMuted,
            align: 'center',
            valign: 'top',
          });

          slide.addText(`Topic: ${pres.topic} • Traditional Seminar Series`, {
            x: 1.0,
            y: 5.8,
            w: 11.33,
            h: 0.4,
            fontSize: 14,
            fontFace: theme.fontBody,
            color: theme.textMuted,
            align: 'center',
          });
        }
        break;
      }

      case 'content': {
        addSlideHeader(slide, slideContent.title);

        const hasImage = !!slideContent.image?.url;
        
        // Setup text column dimensions
        const textX = 0.8;
        const textY = 1.6;
        const textW = hasImage ? 6.5 : 11.7;
        const textH = 4.8;

        if (slideContent.bullets && slideContent.bullets.length > 0) {
          const bulletObjects = slideContent.bullets.map((b) => ({
            text: b,
            options: {
              bullet: true,
              fontSize: 16,
              color: theme.textMain,
              fontFace: theme.fontBody,
              lineSpacing: 26,
            },
          }));

          slide.addText(bulletObjects, {
            x: textX,
            y: textY,
            w: textW,
            h: textH,
            valign: 'top',
          });
        }

        // Add visual image on the right if present
        if (hasImage && slideContent.image) {
          try {
            // Draw a subtle dark placeholder behind the image for better load presentation
            slide.addShape(pptx.ShapeType.rect, {
              x: 8.0,
              y: 1.6,
              w: 4.5,
              h: 4.0,
              fill: { color: theme.cardBg },
              line: { color: theme.border, width: 1 },
            });

            slide.addImage({
              path: slideContent.image.url,
              x: 8.0,
              y: 1.6,
              w: 4.5,
              h: 4.0,
              sizing: { type: 'cover', w: 4.5, h: 4.0 },
            });

            // Photographer Credit text
            const creditText = `Photo by ${slideContent.image.photographer} via Unsplash`;
            slide.addText(creditText, {
              x: 8.0,
              y: 5.7,
              w: 4.5,
              h: 0.3,
              fontSize: 9,
              fontFace: theme.fontBody,
              color: theme.textMuted,
              italic: true,
              align: 'right',
            });
          } catch (err) {
            console.error('Error adding image to slide:', err);
          }
        }
        break;
      }

      case 'chart': {
        addSlideHeader(slide, slideContent.title);

        const hasChartData = slideContent.chartData && slideContent.chartData.length > 0;
        
        // Slide contains bullets explanations on the left
        const textX = 0.8;
        const textY = 1.6;
        const textW = hasChartData ? 5.2 : 11.7;
        const textH = 4.8;

        if (slideContent.bullets && slideContent.bullets.length > 0) {
          const bulletObjects = slideContent.bullets.map((b) => ({
            text: b,
            options: {
              bullet: true,
              fontSize: 15,
              color: theme.textMain,
              fontFace: theme.fontBody,
              lineSpacing: 24,
            },
          }));

          slide.addText(bulletObjects, {
            x: textX,
            y: textY,
            w: textW,
            h: textH,
            valign: 'top',
          });
        }

        // Add native PowerPoint editable chart on the right
        if (hasChartData && slideContent.chartData) {
          const labels = slideContent.chartData.map((d) => d.label);
          const values = slideContent.chartData.map((d) => d.value);

          const chartData = [
            {
              name: 'Values',
              labels,
              values,
            },
          ];

          // Determine chart type
          let chartType = pptx.ChartType.bar;
          if (slideContent.chartType === 'line') chartType = pptx.ChartType.line;
          else if (slideContent.chartType === 'pie') chartType = pptx.ChartType.pie;

          // Chart style options
          const chartOptions: pptxgen.IChartOpts = {
            x: 6.5,
            y: 1.6,
            w: 6.0,
            h: 4.2,
            showTitle: false,
            showLegend: chartType === pptx.ChartType.pie,
            chartColors: [theme.primary, theme.accent, '34D399', 'FBBF24', 'F87171'],
            titleFontFace: theme.fontTitle,
            legendFontFace: theme.fontBody,
            legendColor: theme.textMain,
          };

          // Native editable chart insert
          slide.addChart(chartType, chartData, chartOptions);
        }
        break;
      }

      case 'table': {
        addSlideHeader(slide, slideContent.title);

        const hasTableData = slideContent.tableData && slideContent.tableData.length > 0;

        if (hasTableData && slideContent.tableData) {
          // Format table rows
          const tableRows = slideContent.tableData.map((row, rIdx) => {
            const isHeader = rIdx === 0;
            return row.map((cell) => ({
              text: cell,
              options: {
                fill: { color: isHeader ? theme.primary : rIdx % 2 === 0 ? theme.cardBg : theme.bg },
                color: isHeader ? '#FFFFFF' : theme.textMain,
                fontFace: isHeader ? theme.fontTitle : theme.fontBody,
                fontSize: isHeader ? 14 : 12,
                bold: isHeader,
                border: { pt: 1, color: theme.border },
                align: 'center',
                valign: 'middle',
              },
            }));
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          slide.addTable(tableRows as any, {
            x: 0.8,
            y: 1.8,
            w: 11.7,
            h: Math.min(4.0, tableRows.length * 0.5),
          });
        }

        // Supporting note below table
        if (slideContent.bullets && slideContent.bullets.length > 0) {
          slide.addText(slideContent.bullets[0], {
            x: 0.8,
            y: 5.9,
            w: 11.7,
            h: 0.5,
            fontSize: 13,
            fontFace: theme.fontBody,
            color: theme.textMuted,
            italic: true,
          });
        }
        break;
      }

      case 'quote': {
        // Highlight/Quote Slide
        // Styled as a clean minimalist card in the center
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.5,
          y: 1.8,
          w: 10.33,
          h: 3.8,
          fill: { color: theme.cardBg },
          line: { color: theme.border, width: 2 },
        });

        // Add quotes icons decoration
        slide.addText('“', {
          x: 2.0,
          y: 2.0,
          w: 1.0,
          h: 1.0,
          fontSize: 80,
          fontFace: 'Georgia',
          color: theme.primary,
          bold: true,
        });

        slide.addText(slideContent.quote || slideContent.bullets?.[0] || '', {
          x: 2.5,
          y: 2.4,
          w: 8.33,
          h: 2.0,
          fontSize: 22,
          fontFace: theme.fontTitle,
          color: theme.textMain,
          italic: true,
          align: 'center',
          valign: 'middle',
        });

        if (slideContent.quoteAuthor) {
          slide.addText(`— ${slideContent.quoteAuthor}`, {
            x: 2.5,
            y: 4.6,
            w: 8.33,
            h: 0.5,
            fontSize: 15,
            fontFace: theme.fontBody,
            color: theme.primary,
            bold: true,
            align: 'center',
          });
        }
        break;
      }

      case 'references': {
        addSlideHeader(slide, slideContent.title || 'References');

        if (slideContent.bullets && slideContent.bullets.length > 0) {
          const refObjects = slideContent.bullets.map((ref) => ({
            text: ref,
            options: {
              bullet: true,
              fontSize: 13,
              color: theme.textMain,
              fontFace: theme.fontBody,
              lineSpacing: 18,
            },
          }));

          slide.addText(refObjects, {
            x: 0.8,
            y: 1.6,
            w: 11.7,
            h: 4.8,
            valign: 'top',
          });
        } else {
          slide.addText('No external sources referenced.', {
            x: 0.8,
            y: 2.0,
            w: 11.7,
            h: 1.0,
            fontSize: 16,
            fontFace: theme.fontBody,
            color: theme.textMuted,
          });
        }
        break;
      }
    }
  });

  // Write file to download directly in browser
  const sanitizedFilename = pres.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  await pptx.writeFile({ fileName: `presentation_${sanitizedFilename}.pptx` });
}
