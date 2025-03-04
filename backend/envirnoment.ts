"use server"
import { auth } from '@/auth'
import { db } from '@/db';
import { revalidatePath } from 'next/cache';


////// Environment
type createEnvironmentProps = {
  name: string,
  password: string
}
// create Environment
export async function createAnEnvironment({name, password}: createEnvironmentProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const if_envirnoment_existsed = await db.environment.findMany({ where: { name } });
  
      if (!name || if_envirnoment_existsed!.length >=1) {
        return ("Name already exists");
    }
    const environment = await db.environment.create({
      data: {
        name,
        password,
        ownerId: user.id
      }
    })
    console.log("environment created successfully");
    revalidatePath("/")
    return environment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
// get Environment
export async function getEnvironment({name}: {name: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const envirnoment = await db.environment.findMany({
      where: {
        name: { contains: name.trim(), mode: 'insensitive' },
      }, include: {
        phones: true,
        items: true,
        collaborators: true,
        owner: true
      } });

    revalidatePath("/")
    return envirnoment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getEnvironmentById({id}: {id: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    if(!id) return Error("Error--- Got no id!!")
    const envirnoment = await db.environment.findUnique({
      where: {
        id,
      },
      include: {
          phones: {
            orderBy: {
              createdAt: "desc",
            },
        },
        items: {
          orderBy: {
            createdAt: "desc",
          }
        },
        collaborators: {
          include:{user: true}
        },
        owner: true
      },
    });

    revalidatePath("/")
    return envirnoment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
// delete Environment
export async function deleteEnvironment({id}: {id: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const envirnoment = await db.environment.findUnique({
      where: {
        id,
      },
      include: {
        phones: true,
        items: true,
        collaborators: true,
        accessEmails: true,
        owner: true
      }
    });

    console.log("environment created successfully");
    revalidatePath("/")
    return envirnoment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}

/////// Phone
// create Phone
type createPhoneProps = {
  phoneName :   string
  buyerName:    string
  buyerNumber?: string
  price: string
  firstPrice: string
  profit: string
  fixedCut: string
  type:         string
  environmentId: string
  userId?: string
}
export async function createPhone({phoneName, buyerName, buyerNumber, price, firstPrice, type, environmentId, profit, fixedCut, userId}: createPhoneProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
        const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return new Error("Environment Not Found");
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator || isCollaborator?.role === 'VIEWER') {
      return new Error("You are not allowed to create");
    }
  const number = String(Number(price) + Number(profit) - Number(firstPrice));
    const months = Math.max(1, Math.ceil(Number(number) / parseInt(fixedCut!)))
    const phone = await db.phone.create({
      data: {
        phoneName,
        buyerName,
        buyerNumber,
        price,
        firstPrice,
        profit,
        fixedCut,
        type,
        environmentId,
        updatedPrice: String(Number(price) + Number(profit) - Number(firstPrice)),
        creatorId: userId || user.id,
      },
      include: {
        isPaids: true
      }
    })

    console.log("Phone created successfully");
    revalidatePath("/")
    return phone
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}

// get phones
type GetAPhones = {
  environmentId: string,
  phoneName: string,
  type: 'Items'| string,
}
export async function getAPhone({environmentId, phoneName, type}: GetAPhones) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return new Error("Environment Not Found");
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator) {
      return new Error("Access Denied: You are not authorized to view this data.");
    }
    const phones = await db.phone.findMany({
      where: {
        environmentId,
        phoneName: {contains: phoneName, mode:'insensitive'},
        type,
      },
      include: {
        creator: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    revalidatePath("/")
    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function deleteMyPhone(id: string, envId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: envId },
      select: { ownerId: true },
    });

    if (!environment) {
      return new Error("Environment Not Found");
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId: envId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator || isCollaborator?.role === 'VIEWER') {
      return new Error("You are not allowed to delete");
    }
    
    const phones = await db.$transaction([
  db.isPaid.deleteMany({ where: { phoneId: id } }), // Delete related records first
  db.phone.delete({ where: { id } }) // Then delete the phone
]);


    revalidatePath("/")
    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getMyPhone(id: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    
    const phones = await db.phone.findUnique({
      where: {
        id,
      },
      include: {
        creator: true
      },
    });

    revalidatePath("/")
    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function updatePhone({id, environmentId, value}: {id: string, environmentId: string, value: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
      const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return new Error("Environment Not Found");
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator || isCollaborator?.role === 'VIEWER') {
      return new Error("You are not allowed to create");
    }
    const phones = await db.phone.update({
      where: {
        id,
      },
      data: {
        updatedPrice: value,
      }
    });

    revalidatePath("/")
    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getPhone(environmentId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return "You need to sign in first";
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || !user.id) {
      return "User Not Found";
    }

    // Check if the user is the owner of the environment
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return "Environment Not Found";
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator) {
      return "Access Denied: You are not authorized to view this data.";
    }

    // Fetch the phones if the user is authorized
    const phones = await db.phone.findMany({
      where: {
        environmentId,
      },
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    revalidatePath("/");
    return phones;
  } catch (err: unknown) {
    if (err instanceof Error) return "Error----" + err.message;
    else return "Unknown Error occurred";
  }
}
export async function getCollaboratorsPhones(environmentId: string, creatorId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return "You need to sign in first";
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || !user.id) {
      return "User Not Found";
    }

    // Check if the user is the owner of the environment
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return "Environment Not Found";
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator) {
      return "Access Denied: You are not authorized to view this data.";
    }

    // Fetch the phones if the user is authorized
    const phones = await db.phone.findMany({
      where: {
        environmentId,
        creatorId,
      },
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    revalidatePath("/");
    return phones;
  } catch (err: unknown) {
    if (err instanceof Error) return "Error----" + err.message;
    else return "Unknown Error occurred";
  }
}


// create Item
export type createItemProps = {
  itemName :   string
  type:         string
  price?:         string
  environmentId:string
}
export async function createItem({itemName, type, environmentId, price}: createItemProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
     const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return new Error("Environment Not Found");
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator || isCollaborator?.role === 'VIEWER') {
      return new Error("You are not allowed to create");
    }
    const phone = await db.item.create({
      data: {
        itemName,
        price: price!,
        type,
        environmentId,
      }
    })
    
    revalidatePath("/")
    return phone
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getItems(environmentId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return "You need to sign in first";
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || !user.id) {
      return "User Not Found";
    }

    // Check if the user is the owner of the environment
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return "Environment Not Found";
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator) {
      return "Access Denied: You are not authorized to view this data.";
    }

    // Fetch the phones if the user is authorized
    const phones = await db.item.findMany({
      where: {
        environmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    revalidatePath("/");
    return phones;
  } catch (err: unknown) {
    if (err instanceof Error) return "Error----" + err.message;
    else return "Unknown Error occurred";
  }
}

export async function getAnItem({environmentId, itemName, type}: createItemProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const phones = await db.item.findMany({
      where: {
        environmentId,
        itemName: {contains: itemName, mode:'insensitive'},
        type,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    revalidatePath("/")
    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}


/// add A Collaborator

export type accessEmailsProps = {
  email: string;
  role: "VIEWER" | "ADMIN";
  environmentId: string;
  
}
export type collaboratorProps = {
  environmentId: string,
  password: string
}
export async function addAccessEmails({email, role, environmentId}:accessEmailsProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !email) {
      return "Please, enter a valid email  \"example@email.com\"✅";
    }
    const isEmailExsits = await db.accessEmail.findUnique({ where: { email } })
    if (isEmailExsits) {
      return Error("Email is already exists, please add a different one")
    }
    const phone = await db.accessEmail.create({
      data: {
        email,
        role,
        environmentId,
      }
    })
    console.log("Email added successfully");
    revalidatePath("/")
    return phone
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function JoinEnviromnent({environmentId, password}: collaboratorProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new Error("Environment not found");
    }

    const isAccepted = await db.accessEmail.findUnique({
      where: { email: session.user.email },
    });
    if (!isAccepted) {
      throw new Error("Sorry, you're not allowed to join");
    }
    if (environment.password !== password) {
      throw new Error("Incorrect password");
    }

    // Check if the user is already a collaborator
    const existingCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
        
      },
    });

    if (existingCollaborator) {
      throw new Error("User is already a collaborator in this environment");
    }

    // Add the new collaborator to the environment
    const newCollaborator = await db.collaborator.create({
      data: {
        userId: user.id,
        environmentId,
        role: isAccepted.role,
      },
    });

    revalidatePath("/")
    return newCollaborator;
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getARole(environmentId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new Error("Environment not found");
    }

    const collaborator = await db.collaborator.findFirst({
      where: {
        userId: user.id,
        environmentId,
      },
      include: {
        user: true,
      },
    });

    revalidatePath("/")
    if (environment.ownerId === user.id) {
      return "ADMIN" 
    }else return collaborator?.role
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}

/////

export async function createIsPaid({id, envId, position}:{id: string, envId: string, position: number}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: envId},
    });


    if (!environment) {
      throw new Error("Environment not found");
    }
    

    const create = await db.isPaid.create({
      data: {
        position,
        isPaid: true,
        phoneId: id,
      },
    });

    revalidatePath("/")
    return create;
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getIsPaid({id, envId}:{id: string, envId: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: envId},
    });


    if (!environment) {
      throw new Error("Environment not found");
    }
    

    const collaborator = await db.isPaid.findMany({
      where: {
        phoneId: id,
      },
    });

    revalidatePath("/")
    return collaborator;
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function updateIsPaid({id, envId}:{id: string, envId: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: envId},
    });

    if (!environment) {
      throw new Error("Environment not found");
    }

    const collaborator = await db.isPaid.update({
      where: {
        id,
      },
      data: {
        isPaid: true
      }
    });

    revalidatePath("/")
    return collaborator;
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}