import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import type { ReactElement } from "react";

interface PageProps {
	params: Promise<{
		all: string[]
	}>,
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BreadcrumbSlot({
	params,
	searchParams,
}: PageProps) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;
	const breadcrumbItems: ReactElement[] = [];
	let breadcrumbPage: ReactElement = <></>;
	for (let i = 0; i < resolvedParams.all.length; i++) {
		let route = resolvedParams.all[i];
		const href = `/${resolvedParams.all.at(0)}/${route}`;
		if (route === 'login') {
			route = 'חיבור';
		}
		console.log("route", route);
		if (i === resolvedParams.all.length - 1) {
			breadcrumbPage = (
				<BreadcrumbItem>
					<BreadcrumbPage className="capitalize">{route}</BreadcrumbPage>
				</BreadcrumbItem>
			);
		} else {
			breadcrumbItems.push(
				<React.Fragment key={href}>
					<BreadcrumbItem>
						<BreadcrumbLink href={href} className="capitalize">
							{route}
						</BreadcrumbLink>
					</BreadcrumbItem>
				</React.Fragment>,
			);
		}
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">בית</BreadcrumbLink>
				</BreadcrumbItem>
				{breadcrumbItems}
                <BreadcrumbSeparator className="rotate-180" />
				{breadcrumbPage}
			</BreadcrumbList>
		</Breadcrumb>
	);
}