import CheckUserLevel from '../../../components/checkUserLevel';

export default function Layout({ children }) {
	return (
		<CheckUserLevel requiredLevel="intermediaire">
			{children}
		</CheckUserLevel>
	);
}