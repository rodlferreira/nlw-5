//SSR -  Server Side Rendering => carrega de uma vez o site tornando o processo um pouco mais lento.
//SSG - Static Site Generation => So funciona em producao
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContexts';
import Episode from './episodes/[slug]';

type Episode = {
//Tipagem dos episodios
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;


}

type HomeProps = {

  latestEpisodes: Episode[];
  allEpisodes: Episode[];
  

}

export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (

    <div className={styles.homepage}>

      <Head>
        <title>Podcast | Tec</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Ultimos lancamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => { // o 'map' percorre algo e retorna algo, diferente do 'for each' que apenas percorre
            return (
              <li key={episode.id}> /*quando utilizamos o 'map' precisamos obrigatiamente 
                                    no primeiro elemento logo apos o 'return', serve para 
                                    que o React melhore a performance definindo o que cada 
                                    item eh, podendo caso necessario, deletar um determinado
                                    item sem que haja a necessidade de recarregar todos os dados.*/
                  <Image            
                    width={192} 
                    height={192} 
                    src={episode.thumbnail} 
                    alt={episode.title} 
                    objectFit="cover"
                  />

                  <div className={styles.episodeDetails}>
                    <Link href={`/episodes/${episode.id}`}>//Comando responsavel por 'linkar' o 'Slug'
                    <a>{episode.title}</a>
                    </Link>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button" onClick={() => playList(episodeList, index)}>
                    <img src="/play-green.svg" alt="Tocar episodio" />
                  </button>
                </li>
            )
            })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episodios</h2>
        <table cellSpacing={0}>
          <thead>
            <th>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duracao</th>
              <th></th>
            </th>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                    width={120}
                    height={120}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar episodio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>    
      </section>
    </div>

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

 
  const episodes = data.map(episode => {  //o 'const' eh seguido de uma variavel
    
    return { //retorno dos objetos que estao relacionados a variavel
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration), 
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0, 2); //o 'slice' separa os itens selecionados
  const allEpisodes = episodes.slice(2, episodes.length)  

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
  
}
