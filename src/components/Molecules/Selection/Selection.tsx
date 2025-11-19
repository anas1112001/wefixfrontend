import { FC } from 'react';

import Container from 'components/Atoms/Container/Container';
import SelectionStyles from 'components/Molecules/Selection/Selection.module.css';
import Image from 'components/Atoms/Image/Image'; // Import the Image component
import Paragraph from 'components/Atoms/Paragraph/Paragraph'; // Import the Paragraph component

interface ISelectionProps {
  data?: DataItem;
  id?: string | number;
  testId?: string;
}

const Selection: FC<ISelectionProps> = ({ data, id, testId }) => (
  <>
    {data && (
      <Container
        className={SelectionStyles.selectionWrapper}
        key={id}
        testId={testId}
      >
        <Image
          alt={data.title}
          className={SelectionStyles.itemLogo}
          src={data.imageSrc}
        />
        <Paragraph className={SelectionStyles.itemName}>{data.title}</Paragraph>  // Updated to use Paragraph
      </Container>
    )}
  </>
)

export default Selection;
