/*
                        !!!!!!!
      ESSE ARQUIVO FOI FEITO PARA SER USADO NO OBSERVABLE
    DESCONSIDERE QUAISQUER ERROS APONTADOS PELO COMPILADOR
                        !!!!!!!
*/

//---------------- Upload de dados ----------------
data = FileAttachment("final_result_filtered_final.csv").csv({typed: true})
tracks = FileAttachment("tracks_info-update-filtered.csv").csv({typed: true})
topo = FileAttachment("br-states.json").json()

//---------------- Gráfico Radial -----------------
radial_chart = {

  // Track de exemplo. Isso deve ser retornado ao pesquisar a faixa desejada.
  const track_id = [
    {
      id: 'spotify:track:7qQV8fo97AFhrL9HPUeAsk',
      artist_names: ['Fernando & Sorocaba', 'Maiara & Maraisa'],
      name: 'Zona de Risco (feat. Maiara & Maraisa) - Ao Vivo',
      genres: ['agronejo','arrocha','sertanejo universitario','sertanejo pop','sertanejo'],
      tempo: 145.784,
      duration: 182850,
      acousticness: 0.519,
      danceability: 0.652,
      energy: 0.918,
      speechiness: 0.22,
      valence: 0.803
    }]
     
  
  const points = d3
    .sort(track_id, (d) => d.id)
    .flatMap(({id, artist_names, name, genres, tempo, duration, ...values}, i) =>
      Object.entries(values).map(([key, raw]) => ({
        id,
        name,
        artist_names,
        genres,
        duration,
        tempo,
        key,
        raw,
        fx: (1 + i) % 4, // trellis (facets); we leave facet <0,0> empty for the legend
        fy: Math.floor((1 + i) / 4)
      }))
    );

  const longitude = d3
    .scalePoint(new Set(Plot.valueof(points, "key")), [180, -180])
    .padding(0.5)
    .align(1);
  
  const chart = Plot.plot({
    width: Math.max(width, 600),
    marginBottom: 10,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [0, -90],
      // Note: 1.22° corresponds to max. percentage (1.0), plus some room for the labels
      domain: d3.geoCircle().center([0, 90]).radius(1.22)()
    },
    facet: {
      data: points,
      x: "fx",
      y: "fy",
      axis: null
    },
    marks: [
      // Facet name
      Plot.text(
        points,
        Plot.selectFirst({
          text: "name",
          frameAnchor: "bottom",
          fontWeight: 400,
          fontSize: 14
        })
      ),

      // grey discs
      Plot.geo([1.0, 0.8, 0.6, 0.4, 0.2], {
        geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
        stroke: "currentColor",
        fill: "currentColor",
        strokeOpacity: 0.2,
        fillOpacity: 0.02,
        strokeWidth: 0.5
      }),
  
      // white axes
      Plot.link(longitude.domain(), {
        x1: longitude,
        y1: 90 - 0.8,
        x2: 0,
        y2: 90,
        stroke: "var(--plot-background)",
        strokeOpacity: 0.5,
        strokeWidth: 2.5
      }),
  
      // axes labels, initials
      Plot.text(longitude.domain(), {
        fx: 0,
        fy: 0,
        facet: "exclude",
        x: longitude,
        y: 90 - 1.09,
        text: (d) => d,
        fontSize: 14,
        lineWidth: 5
      }),
  
      // areas
      Plot.area(points, {
        x1: ({key}) => longitude(key),
        y1: ({raw}) => 90 - raw,
        x2: 0,
        y2: 90,
        fill: "#4269D0",
        fillOpacity: 0.25,
        stroke: "#4269D0",
        curve: "cardinal-closed"
      }),
  
      // points
      Plot.dot(points, {
        x: ({key}) => longitude(key),
        y: ({raw}) => 90 - raw,
        fill: "#4269D0",
        stroke: "var(--plot-background)"
      }),
  
      // interactive labels
      Plot.text(
        points,
        Plot.pointer({
          x: ({key}) => longitude(key),
          y: ({raw}) => 90 - raw,
          text: (d) => `${Math.round(100 * d.raw)}%\n(${d.raw})`,
          textAnchor: "start",
          dx: 4,
          fill: "currentColor",
          stroke: "var(--plot-background)",
          maxRadius: 10,
          fontSize: 12
        })
      )
    ]
  });

  return chart;
}

// ------------- Gráfico Espacial --------------
mapview = vl.markGeoshape({
    fill: "#ddd",
    stroke: "#fff",
    strokeWidth: 1})
  .data(vl.topojson(topo).feature("estados"))
  //.transform(
  //  vl.lookup('proprieties.Name').from(vl.data(data).key('state'))
  //)
  .encode(
    vl.tooltip(["id"])
  )
  .project(vl.projection('mercator'))
  .width(850).height(500)
  .render()

