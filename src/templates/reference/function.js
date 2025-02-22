import React from 'react';
import { graphql } from 'gatsby';
import { LocalizedLink as Link } from 'gatsby-theme-i18n';
import { getImage } from 'gatsby-plugin-image';
import { useLocalization } from 'gatsby-theme-i18n';
import { useIntl } from 'react-intl';

import HeadMatter from '../../components/HeadMatter';

import Layout from '../../components/Layout';
import Content from '../../components/ContentWithSidebar';
import { SidebarTree } from '../../components/Sidebar';
import Section from '../../components/reference/Section';
import License from '../../components/reference/License';
import { CodeList, ExampleList } from '../../components/reference/ContentList';
import { ExampleItem } from '../../components/examples/ExamplesList';
import Breadcrumbs from '../../components/Breadcrumbs';

import { widont } from '../../utils/index.js';
import { useTree, useHighlight, useSidebar, usePdes } from '../../hooks';
import {
  usePreparedItems,
  usePreparedExamples,
  usePreparedList,
  useInUseExamples,
  useTrail
} from '../../hooks/reference';
import { referencePath } from '../../utils/paths';

import * as grid from '../../styles/grid.module.css';

const RefTemplate = ({ data, pageContext, ...props }) => {
  const { name, libraryName } = pageContext;
  const isProcessing = libraryName === 'processing';
  const [showSidebar, setShowSidebar] = useSidebar('reference');

  const { locale } = useLocalization();
  const intl = useIntl();
  useHighlight();

  const parent = data?.parent?.childJson;
  const entry = data?.json?.childJson;

  const items = usePreparedItems(data.items.nodes, libraryName);

  const pdes = usePdes(data.pdes.nodes, locale);
  const examples = usePreparedExamples(pdes, data.images.nodes);
  const tree = useTree(items);

  const inUse = usePreparedList(entry?.inUse, libraryName, true, true);
  const parameters = usePreparedList(entry?.parameters, libraryName);
  const syntax = usePreparedList(entry?.syntax, libraryName);
  const related = usePreparedList(entry?.related, libraryName, true, true);
  const returns = usePreparedList(entry?.returns, libraryName);
  const inUseExamples = useInUseExamples(
    pageContext.inUseExamples,
    data.inUseImages
  );

  const trail = useTrail(
    libraryName,
    parent ? parent.category : entry?.category,
    parent ? parent.subcategory : entry?.subcategory,
    entry?.classanchor
  );

  return (
    <Layout withSidebar withBreadcrumbs>
      <HeadMatter
        title={
          (entry?.name ?? data.en.childJson.name) + ' / ' + isProcessing
            ? intl.formatMessage({ id: 'reference' })
            : intl.formatMessage({ id: 'libraries' })
        }
        description={entry?.description}
        img={getImage(data.images.nodes[0])}
      />

      <div className={grid.grid}>
        <SidebarTree
          title={intl.formatMessage({ id: 'reference' })}
          tree={tree}
          setShow={setShowSidebar}
          show={showSidebar}
        />
        {entry ? (
          <Content sidebarOpen={showSidebar}>
            <Breadcrumbs trail={trail} />
            <Section short title={intl.formatMessage({ id: 'name' })}>
              <h3>{entry.name}</h3>
            </Section>
            {entry?.classanchor && (
              <Section title={intl.formatMessage({ id: 'class' })}>
                <h4>{entry.classanchor} </h4>
              </Section>
            )}
            <Section title={intl.formatMessage({ id: 'description' })}>
              <p
                dangerouslySetInnerHTML={{ __html: widont(entry.description) }}
              />
            </Section>
            {examples && (
              <Section
                columns={false}
                title={intl.formatMessage({ id: 'examples' })}>
                <ExampleList examples={examples} />
              </Section>
            )}
            {syntax && (
              <Section title={intl.formatMessage({ id: 'syntax' })}>
                <CodeList items={syntax} />
              </Section>
            )}
            {parameters && (
              <Section title={intl.formatMessage({ id: 'parameters' })}>
                <CodeList variant="parameters" items={parameters} />
              </Section>
            )}
            {returns && (
              <Section title={intl.formatMessage({ id: 'return' })}>
                <CodeList items={returns} />
              </Section>
            )}
            {inUse && (
              <Section title={intl.formatMessage({ id: 'inUse' })}>
                <CodeList items={inUse} />
              </Section>
            )}
            {related && (
              <Section title={intl.formatMessage({ id: 'related' })}>
                <CodeList items={related} />
              </Section>
            )}
            {inUseExamples && (
              <Section title={intl.formatMessage({ id: 'inUse' })}>
                <ul className={grid.grid}>
                  {inUseExamples.slice(0, 6).map((e, key) => (
                    <ExampleItem
                      node={e}
                      key={`e-${e.name}`}
                      variant="related"
                    />
                  ))}
                </ul>
              </Section>
            )}
            <License />
          </Content>
        ) : (
          <Content sidebarOpen={showSidebar}>
            {intl.formatMessage({ id: 'notTranslated' })}
            <Link to={referencePath(name, libraryName)}>
              {' '}
              {intl.formatMessage({ id: 'englishPage' })}
            </Link>
          </Content>
        )}
      </div>
    </Layout>
  );
};

export default RefTemplate;

export const query = graphql`
  query(
    $name: String!
    $relDir: String!
    $locale: String!
    $inUseExamples: [String!]!
    $libraryName: String!
    $hasClassanchor: Boolean!
    $classanchor: String
  ) {
    json: file(fields: { name: { eq: $name }, lang: { eq: $locale } }) {
      childJson {
        name
        description
        syntax
        category
        subcategory
        parameters {
          name
          description
          type
        }
        related
        returns
        classanchor
      }
    }
    en: file(fields: { name: { eq: $name }, lang: { eq: "en" } }) {
      childJson {
        name
      }
    }
    parent: file(fields: { name: { eq: $classanchor }, lang: { eq: "en" } })
      @include(if: $hasClassanchor) {
      childJson {
        name
        category
        subcategory
      }
    }
    images: allFile(
      filter: {
        relativeDirectory: { eq: $relDir }
        extension: { regex: "/(jpg)|(jpeg)|(png)|(gif)/" }
      }
    ) {
      nodes {
        name
        extension
        childImageSharp {
          gatsbyImageData(width: 400)
        }
      }
    }
    pdes: allFile(
      filter: {
        sourceInstanceName: { eq: "reference-examples" }
        relativeDirectory: { eq: $relDir }
        fields: { lang: { in: ["en", $locale] } }
        extension: { eq: "pde" }
      }
    ) {
      nodes {
        name
        fields {
          name
          lang
        }
        childRawCode {
          content
        }
      }
    }
    items: allFile(
      filter: { fields: { lib: { eq: $libraryName }, lang: { eq: "en" } } }
    ) {
      nodes {
        name
        relativeDirectory
        childJson {
          category
          subcategory
          name
          type
        }
      }
    }
    inUseImages: allFile(
      filter: {
        name: { in: $inUseExamples }
        sourceInstanceName: { eq: "examples" }
        extension: { regex: "/(jpg)|(jpeg)|(png)|(gif)/" }
        relativeDirectory: { regex: "/^((?!data).)*$/" }
      }
    ) {
      nodes {
        name
        relativeDirectory
        childImageSharp {
          gatsbyImageData(width: 400)
        }
      }
    }
    libName: mdx(frontmatter: { name: { eq: $libraryName } }) {
      frontmatter {
        title
      }
    }
  }
`;
