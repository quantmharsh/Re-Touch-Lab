"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { navLinks } from "../../../constants";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

const Sidebar = () => {
	const pathname = usePathname();
	return (
		<aside className="sidebar">
			<div className=" flex  size-full flex-col gap-4">
				<Link href="/" className="sidebar-logo">
					<Image
						src="/assets/images/logo-text.svg"
						alt="logo"
						width={180}
						height="28"
					/>
				</Link>
				<nav className="sidebar-nav">
					{/* sidgnedIn we are getting from clerk . jsx under  it will  be rendered only if user is logged in */}
					<SignedIn>
						<ul className="sidebar-nav_elements">
							{navLinks.slice(0,6).map((link) => {
								const isActive = pathname === link.route;
								return (
									<li
										key={link.route}
										className={`sidebar-nav_element group ${
											isActive
												? "bg-purple-gradient text-white"
												: "text-gray-700 "
										}`}>
										<Link href={link?.route!} className="sidebar-link">
											<Image
												src={link?.icon}
												alt="logo"
												width={24}
												height={24}
												className={`${isActive && "brightness-200"}`}
											/>
											{link?.label}
										</Link>
									</li>
								);
							})}
                            </ul>
                            {/* //Dividing navlinks into two part to get gap between functionalit and personal area */}
                            <ul className="sidebar-nav_elements">
                            {navLinks.slice(6).map((link) => {
								const isActive = pathname === link.route;
								return (
									<li
										key={link.route}
										className={`sidebar-nav_element group ${
											isActive
												? "bg-purple-gradient text-white"
												: "text-gray-700 "
										}`}>
										<Link href={link?.route!} className="sidebar-link">
											<Image
												src={link?.icon}
												alt="logo"
												width={24}
												height={24}
												className={`${isActive && "brightness-200"}`}
											/>
											{link?.label}
										</Link>
									</li>
								);
							})}
                            {/* This is for showing clerk user button so that  they can logout  */}
							<li className="flex-center cursor-pointer gap-2 p-4 ">
								<UserButton showName />
							</li>
						</ul>
					</SignedIn>
					<SignedOut>
						<Button asChild className="button bg-purple-gradient bg-cover">
							<Link href="/sign-in">Login</Link>
						</Button>
					</SignedOut>
				</nav>
			</div>
		</aside>
	);
};

export default Sidebar;
