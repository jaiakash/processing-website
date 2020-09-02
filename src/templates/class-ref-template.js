import React from 'react';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/Layout';

const ClassRefTemplate = ({ data, pageContext }) => {
  let ref = data.json.childJson;

  return (
    <Layout>
      <h1>Classname: {ref.name}</h1>
      <p>Description: {ref.description}</p>
      Parameters:
      {ref.parameters.map((param, key) => {
        return (
          <p key={'param' + key}>
            {param.name + ': ' + param.type + ' - ' + param.description}
          </p>
        );
      })}
      Examples:
      <ul>
        {data.allFile.edges.map((edge, key) => {
          return (
            <li key={'ex' + key}>
              {edge.node.extension === 'pde' && (
                <p>
                  {edge.node.name}
                  {edge.node.internal.content}
                </p>
              )}
              {edge.node.extension === 'png' && (
                <Img fixed={edge.node.childImageSharp.fixed} />
              )}
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

export default ClassRefTemplate;

export const query = graphql`
  query($name: String!, $assetsName: String!) {
    json: file(fields: { name: { eq: $name } }) {
      childJson {
        name
        description
        parameters {
          name
          description
          type
        }
      }
    }
    allFile(filter: { relativeDirectory: { eq: $assetsName } }) {
      edges {
        node {
          name
          internal {
            content
          }
          extension
          childImageSharp {
            fixed {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    }
  }
`;