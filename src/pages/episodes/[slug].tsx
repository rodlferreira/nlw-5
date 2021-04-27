import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import styles from './episode.module.scss';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContexts';


/*Aqui eh feito o 'roteamento' que funciona, criando uma pasta dentro do 'pages' e 
 um arquivo dentro dessa pasta, para que o Reaact possa dirercionar da forma correta.
 A criacao do arquivo deve obedecer o seguinte formato: '[nome do arquivo].tsx' */


type Episode = {
    id: string;
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    durationAsString: string;
    url: string;
    publishedAt: string;
    description: string;
};

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const{ play } = usePlayer();/* tambem chamado de 'Hook do React' todo metodo que comeca 
                                    que com 'use' e s'o pode ser usado dentro de um componente.*/
    
    return (
        <div className={styles.episode}>

        <Head>
            <title>{episode.title} | Tec</title>
        </Head>  

            <div className={styles.thumbnailContainer}>
                <Link href="/">
                <button type="button">
                    <img src="/arrow-left.svg" alt="Voltar" />
                </button>
                </Link>
                <Image 
                    width={700} 
                    height={160} 
                    src={episode.thumbnail} 
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episodio" />
                </button>
            </div>
            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div 
                className={styles.description} 
                dangerouslySetInnerHTML={{__html: episode.description}} 
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {//Metodo que trabalha paginas estaticas de algo que pode ser dinamico
    const { data } = await api.get('episodes', {
        params: { 
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })
    
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })
    return {
        paths: [],
        fallback: 'blocking'
/* O que determina o comportamento de quando uma pessoa acessa a pagina
de um episodio que nao foi gerado estaticamente eh o "fallback" 
fallback false retorna ERRO 404, o falback true ele vai tentar buscar os dados do episodio novo
para criar uma pagina estatica daquele episodio e tornar a nova pagina estatica para novos acessos
a grande vantagem do blocking eh a geracao de novas paginas conforme novas pessoas acessam. */        
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params; //'params' eh de onde buscamos os dados

    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration), 
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
      };

    return {
        props: {episode, 
        },
        revalidate: 60 * 60 * 24, // 24 hotas
    }
}